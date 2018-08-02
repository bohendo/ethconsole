const Web3 = require('web3')

const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.ETHPROVIDER))

web3.eth.getBlock('latest').then(response => {
    if (response.number) {
        console.log(`Connection to ethereum provider success, synced to block: ${response.number}`)
    } else {
        console.log(`Connection to ethereum provider failed`)
    }
}).catch(response => {
    console.log(`Connection to ethereum provider failed`)
})

module.exports = web3
