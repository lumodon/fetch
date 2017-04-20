const fs = require('fs')
const http = require('http')

  // '2008': 352816,
  // '2009': 348231,
  // '2010': 347212,
  // '2011': 346195,
  // '2012': 345184,
  // '2013': 391746,
  // '2014': 500629,
  // 2008 - 2014: 'http://fortune.com/data/franchise-list/'+String(yearCode)+'/'+iteration
  // '2015': 'http://fortune.com/api/v2/list/1141696/expand/item/ranking/asc/0/100',
  // '2016': 'http://fortune.com/api/v2/list/1666518/expand/item/ranking/asc/0/100'

const START_POS = 1
const END_POS = 50
// const START_POS = 0
// const END_POS = 10

function fetch(iteration, callback, yearCode) {
  return http.get({
      host: 'fortune.com',
      path: 'http://fortune.com/data/franchise-list/'+String(yearCode)+'/'+iteration
      // path: 'http://fortune.com/api/v2/list/'+String(yearCode)+'/expand/item/ranking/asc/'+iteration*100+'/100'
  }, response => {
    let body = ''
    response.on('data', d => {
      body += d
    })
    response.on('end', () => {
      let responseObj = JSON.parse(body)
      let parsedObj = {}
      for(item in responseObj['articles']) {
        let itemItself = responseObj['articles'][item]
        parsedObj[itemItself.rank] = {
          // 'title': itemItself.title,
          // 'website': itemItself.meta.website,
          'title': itemItself.title,
          'website': itemItself.highlights.Website,
          'ticker': itemItself.ticker_text
        }
      }
      callback(parsedObj)
    })
  })
}

function gatherData() {
  let prmArray = []
  const years = {
    '2008': '352816',
    '2009': '348231',
    '2010': '347212',
    '2011': '346195',
    '2012': '345184',
    '2013': '391746',
    '2014': '500629'
  }
  // const years = {
  //   '2015': '1141696',
  //   '2016': '1666518'
  // }
  for(year in years) {
    for(let i = START_POS; i <= END_POS; i++) {
      let prm = new Promise( (resolve, reject) => {
        fetch(i, resolve, years[year])
      })
      prmArray.push(prm)
    }

    let parentObj = {}
    !function(currYear){
      Promise.all(prmArray)
      .then( entireObject => {
        entireObject.forEach( (chunkOfData, iterator) => {
          for(let chunk in chunkOfData) {
            parentObj[chunk] = chunkOfData[chunk]
          }
        })
        fsCurry(parentObj, currYear)
      })
    }(year)
  }
  console.log('Completed promise chain. Awaiting async results')
}

function fsCurry(text, yearNum) {
  const fileName = './'+String(yearNum)+'.json'
  fs.writeFile(fileName, JSON.stringify(text, null, 2), err => {
    if(err) return console.error(err)
  })
  console.log('file saved: ', fileName)
}

console.log('Beginning process: ')
gatherData()

