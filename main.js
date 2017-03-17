const fs = require('fs')
const http = require('http')

function fetch(iteration, callback) {
  return http.get({
      host: 'fortune.com',
      path: 'http://fortune.com/data/franchise-list/500629/'+(iteration)
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
        parsedObj[itemItself.rank] = itemItself.title
      }
      callback(parsedObj)
      callback(responseObj)
    })
  })
}

function gatherData() {
  let prmArray = []
  for(let i = 1; i <= 50; i++) {
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
  fs.writeFile('./2014.json', JSON.stringify(text, null, 2), err => {
    if(err) return console.error(err)
  })
  console.log('file saved.')
}

console.log('Beginning process: ')
gatherData()