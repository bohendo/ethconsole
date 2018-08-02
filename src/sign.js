const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid').default
const Eth = require('@ledgerhq/hw-app-eth').default

global.HID = require('node-hid')

var wallet
const getWallet = () => {
    if (wallet) {
        console.log(`Got cached wallet`)
        return Promise.resolve(wallet)
    }
    console.log(`Getting new wallet`)
    wallet = TransportNodeHid.create(HID.HID).then(transport => new Eth(transport))
    return wallet
}

const sign = (address_index) => {
    return getWallet().then(wallet => {
        const myWallet = wallet.getAddress(`44'/60'/${address_index}'/0/0`)
        return myWallet.then(address => {
            console.log(`Got address: ${JSON.stringify(address.address)}`)
            return address
        }).catch(error => {
            console.log(`Failed to access ledger, please plug-in or unlock device: ${error}`)
        })
    }).catch((error) => {
        console.log(`Failed to access ledger, please plug-in or unlock device: ${error}`)
    })
}

module.exports = sign
