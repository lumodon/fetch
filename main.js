const fs = require('fs')
const http = require('http')

function fetch(iteration, callback) {
  return http.get({
      host: 'fortune.com',
      path: 'http://fortune.com/data/franchise-list/500629/'+iteration
      // path: 'http://fortune.com/api/v2/list/1141696/expand/item/ranking/asc/'+iteration*100+'/100'
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
  for(let i = 1; i <= 20; i++) {
    let prm = new Promise( (resolve, reject) => {
      fetch(i, resolve)
    })
    prmArray.push(prm)
  }

  let parentObj = {}
  Promise.all(prmArray)
    .then( entireObject => {
      entireObject.forEach( (chunkOfData, iterator) => {
        for(let chunk in chunkOfData) {
          parentObj[chunk] = chunkOfData[chunk]
        }
      })
      fsCurry(parentObj)
    })
  console.log('Completed promise chain. Awaiting async results')
}

function fsCurry(text) {
  fs.writeFile('./2014.json', JSON.stringify(text, null, 2), err => {
    if(err) return console.error(err)
  })
  console.log('file saved.')
}

console.log('Beginning process: ')
gatherData()