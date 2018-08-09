const Web3 = require('web3')

console.log(`Connecting to ${process.env.ETH_PROVIDER}`)
const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.ETH_PROVIDER))

web3.eth.getBlock('latest').then(block => {
    if (block.number || typeof block.number === 'number') {
        console.log(`Connection to ethereum provider succeeded`)
        web3.eth.isSyncing().then(isSyncing => {
            if (isSyncing) {
                console.log(`Provider is syncing, currently on block ${isSyncing.currentBlock}, highest block: ${isSyncing.highestBlock}, blocks to go: ${isSyncing.highestBlock - isSyncing.currentBlock}`)
            } else {
                console.log(`Provider is up to date, latest block: ${block.number}`)
            }
        })
    } else {
        console.log(`Connection to ethereum provider failed: ${JSON.stringify(block)}`)
    }
}).catch(response => {
    console.log(`Connection to ethereum provider failed: ${response}`)
})

module.exports = web3
