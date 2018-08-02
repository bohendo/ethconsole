const Web3 = require('web3')
const sign = require('./sign')

console.log(`Connecting to eth provider: ${process.env.ETHPROVIDER}`)

const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.ETHPROVIDER))

web3.eth.getBlock('latest').then(response => {
    if (response.number) {
        console.log(`Ethereum provider synced to block: ${response.number}`)
    } else {
        console.log(`Connection to ethereum provider failed`)
    }
}).catch(response => {
    console.log(`Connection to ethereum provider failed`)
})

web3.sign = sign

global.web3 = web3
