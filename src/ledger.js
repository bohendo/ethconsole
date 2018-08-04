const TransportNodeHid = require('@ledgerhq/hw-transport-node-hid').default
const Eth = require('@ledgerhq/hw-app-eth').default

const hdWalletPath = index => `44'/60'/${index}'/0/0`

const ledgerError = (msg) => {
    throw(msg) // Bubble up to calling function's error handler
}

var ledgerDevice
const getLedgerDevice = () => {
    if (ledgerDevice) {
        return Promise.resolve(ledgerDevice)
    }
    ledgerDevice = TransportNodeHid.create().then(transport => new Eth(transport))
    return ledgerDevice
}

const sign = (index, hexData, signFunction) => {
    return getLedgerDevice().then(ledgerDevice => {
        return ledgerDevice[signFunction](hdWalletPath(index), hexData).then(signature => {
            return signature
        }).catch(ledgerError)
    }).catch(ledgerError)
}

// Define Exported Object
const ledger = {}

ledger.getAddress = (index) => {
    return getLedgerDevice().then(ledgerDevice => {
        return ledgerDevice.getAddress(hdWalletPath(index)).then(address => {
            return address.address
        }).catch(ledgerError)
    }).catch(ledgerError)
}

ledger.signTx = (index, hexTx) => {
    return sign(index, hexTx, 'signTransaction')
}

ledger.signMsg = (index, hexMsg) => {
    return sign(index, hexMsg, 'signPersonalMessage')
}

module.exports = ledger
