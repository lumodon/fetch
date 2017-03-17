const fs = require('fs')
const http = require('http')

function fetch(iteration, callback) {
  return http.get({
      host: 'fortune.com',
      path: 'http://fortune.com/api/v2/list/1666518/expand/item/ranking/asc/'+(iteration*100)+'/100'
  }, response => {
    let body = ''
    response.on('data', d => {
      body += d
    })
    response.on('end', () => {
      let responseObj = JSON.parse(body)
      let parsedObj = {}
      for(item in responseObj['list-items']) {
        let itemItself = responseObj['list-items'][item]
        parsedObj[itemItself.rank] = itemItself.title
      }
      callback(parsedObj)
      callback(responseObj)
    })
  })
}

function gatherData() {
  let prmArray = []
  for(let i = 0; i <= 10; i++) {
    let prm = new Promise( (resolve, reject) => {
      fetch(i, resolve)
    })
    prmArray.push(prm)
  }

  let parentObj = {}
  Promise.all(prmArray)
    .then( entireObject => {
      entireObject.forEach( (chunkOfData, iterator) => {
        parentObj[iterator] = chunkOfData
      })
      fsCurry(parentObj)
    })
  console.log('Completed promise chain. Awaiting async results')
}

function fsCurry(text) {
  fs.writeFile('./2016.json', JSON.stringify(text, null, 2), err => {
    if(err) return console.error(err)
  })
  console.log('file saved.')
}

console.log('Beginning process: ')
gatherData()