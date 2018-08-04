const ledger = require('./ledger')

const walletError = (msg) => {
    if (msg && msg.name && msg.message) console.error(`Wallet Error: ${msg.name}: ${msg.message}`)
    else console.error(msg)
    return false
}

// secretStore = object that implements signTx, signMsg and getAddress
var secretStore = undefined

// Define Exported Object
const wallet = {}

wallet.setSecretStore = (store) => {
    if (store === 'ledger') secretStore = ledger
    // TODO: implement these
    // else if (store === 'local') secretStore = localSecret
    // else if (store === 'ethProvider') secretStore = ethProviderSecret
    else console.log(`Secret store "${store}" not supported. Try "ledger", "local" or "ethProvider"`)
}

wallet.setAccount = (index) => {
    if (!secretStore) return console.log('Secret store not set')
    secretStore.getAddress(index).then(address => {
        process.env.ETH_ADDRESS = address
        process.env.ETH_ADDRESS_INDEX = index
        console.log(`Successfully set "from address" as: accounts[${process.env.ETH_ADDRESS_INDEX}] = "${process.env.ETH_ADDRESS}"`)
    }).catch(walletError)
}

wallet.unsetAccount = () => {
    delete process.env.ETH_ADDRESS
    delete process.env.ETH_ADDRESS_INDEX
    console.log(`Successfully unset "from address"`)
}

wallet.getAddress = (index) => {
    if (!secretStore) return console.log('Secret store not set')
    return secretStore.getAddress(index).catch(walletError)
}

wallet.signTx = (index, hexTx) => {
    if (!secretStore) return console.log('Secret store not set')
    return secretStore.signTx(index, hexTx).catch(walletError)
}

wallet.signMsg = (index, hexMsg) => {
    if (!secretStore) return console.log('Secret store not set')
    return secretStore.signMsg(index, hexMsg).catch(walletError)
}

module.exports = wallet
