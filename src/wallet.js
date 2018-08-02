const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid').default
const Eth = require('@ledgerhq/hw-app-eth').default

const ledgerError = (msg) => {
    console.error(`Failed to access ledger, please plug-in or unlock device: ${msg}`)
}

var ledger
const getLedger = () => {
    if (ledger) {
        return Promise.resolve(ledger)
    }
    ledger = TransportNodeHid.create().then(transport => new Eth(transport))
    return ledger
}

const sign = (address_index, hexData, signFunction) => {
    return getLedger().then(ledger => {
        return ledger[signFunction](`44'/60'/${address_index}'/0/0`, hexData).then(signature => {
            return signature
        }).catch(ledgerError)
    }).catch(ledgerError)
}

// Define Exported Object
const wallet = {}

wallet.getAddress = (address_index) => {
    return getLedger().then(ledger => {
        return ledger.getAddress(`44'/60'/${address_index}'/0/0`).then(address => {
            return address.address
        }).catch(ledgerError)
    }).catch(ledgerError)
}

wallet.signTx = (address_index, hexTx) => {
    return sign(address_index, hexTx, 'signTransaction')
}

wallet.signMsg = (address_index, hexMsg) => {
    return sign(address_index, hexMsg, 'signPersonalMessage')
}

module.exports = wallet
