const Web3 = require('web3')
const Transport = require('@ledgerhq/hw-transport-node-hid')
const Wallet = require('@ledgerhq/hw-app-eth')

console.log(`Connecting to wallet: Ledger`)

console.log(`Connecting to eth provider: ${process.env.ETHPROVIDER}`)

const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.ETHPROVIDER))
const transport = Transport
//const wallet = new Wallet(transport)

web3.eth.getBlock('latest').then(response => {
    if (response.number) {
        console.log(`Ethereum provider synced to block: ${response.number}`)
    } else {
        console.log(`Connection to ethereum provider failed`)
    }
}).catch(response => {
    console.log(`Connection to ethereum provider failed`)
})

global.web3 = web3
global.transport = transport
