import Web3 from 'web3'

//import Transport from "@ledgerhq/hw-transport-node-hid"
import Wallet from '@ledgerhq/hw-app-eth'

console.log(`Connecting to wallet: Ledger`)

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

web3.hid = HID

export default web3
