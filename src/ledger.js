const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid').default
const Eth = require('@ledgerhq/hw-app-eth').default

const ledgerError = (msg) => {
    console.log('ledger error detected')
    throw(msg)
}

var ledgerDevice
const getLedgerDevice = () => {
    if (ledgerDevice) {
        return Promise.resolve(ledgerDevice)
    }
    ledgerDevice = TransportNodeHid.create().then(transport => new Eth(transport))
    return ledgerDevice
}

const sign = (address_index, hexData, signFunction) => {
    return getLedgerDevice().then(ledgerDevice => {
        return ledgerDevice[signFunction](`44'/60'/${address_index}'/0/0`, hexData).then(signature => {
            return signature
        }).catch(ledgerError)
    }).catch(ledgerError)
}

// Define Exported Object
const ledger = {}

ledger.getAddress = (address_index) => {
    return getLedgerDevice().then(ledgerDevice => {
        return ledgerDevice.getAddress(`44'/60'/${address_index}'/0/0`).then(address => {
            return address.address
        }).catch(ledgerError)
    }).catch(ledgerError)
}

ledger.signTx = (address_index, hexTx) => {
    return sign(address_index, hexTx, 'signTransaction')
}

ledger.signMsg = (address_index, hexMsg) => {
    return sign(address_index, hexMsg, 'signPersonalMessage')
}

module.exports = ledger
