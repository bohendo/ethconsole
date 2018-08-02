import Web3 from 'web3'
import Wallet from '@ledgerhq/hw-app-eth'

console.log(typeof Web3)
console.log(typeof Wallet)

console.log(`Starting console in environment: ${JSON.stringify(process.env)}`)

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.ETHPROVIDER))

web3.wallet = Wallet

export default web3
