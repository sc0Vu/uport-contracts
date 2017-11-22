var Web3 = require('web3');
var HDWalletProvider = require("truffle-hdwallet-provider");
var mnemonic = require('./testMnemonics');
var testRPC = require("ethereumjs-testrpc");

module.exports = {
  networks: {
    development: {
      host: 'localhost',
      port: 8546,
      network_id: '*'
    },
    ropsten: {
      network_id: 3,
      provider: new HDWalletProvider(mnemonic.ropsten, "https://ropsten.infura.io/")
    },
    kovan: {
      network_id: 42,
      provider: new HDWalletProvider(mnemonic.kovan, "https://kovan.infura.io/")
    },
    ethereum: {
      network_id: 1,
      provider: new HDWalletProvider(mnemonic.ethereum, "https://mainnet.infura.io/"),
      gas: 4000000,
      gasPrice: 25000000000
    },
    test: {
      network_id: '*',
      provider: testRPC.provider({ seed: 'test' }),
    }
  }
}
