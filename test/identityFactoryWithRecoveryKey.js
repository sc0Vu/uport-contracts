const IdentityFactoryWithRecoveryKey = artifacts.require('IdentityFactoryWithRecoveryKey')
const Proxy = artifacts.require('Proxy')
const RecoverableController = artifacts.require('RecoverableController')

contract('IdentityFactoryWithRecoveryKey', (accounts) => {
  let proxy
  let initProxy
  let initRecoverableController
  let recoverableController
  let deployedIdentityFactoryWithRecoveryKey
  let user1
  let nobody

  let proxyAddress
  let recoverableControllerAddress
  let recoveryKey

  let shortTimeLock = 2
  let longTimeLock = 7

  before((done) => {
    // Truffle deploys contracts with accounts[0]
    user1 = accounts[0]
    nobody = accounts[1] // has no authority
    recoveryKey = accounts[4]

    IdentityFactoryWithRecoveryKey.deployed().then((instance) => {
      deployedIdentityFactoryWithRecoveryKey = instance
      return Proxy.new({from: accounts[0]})
    }).then((instance) => {
      initProxy = instance
      return RecoverableController.new({from: accounts[0]})
    }).then((instance) => {
      initRecoverableController = instance
      done()
    })
  })

  it('Correctly creates proxy and controller', (done) => {
    let event = deployedIdentityFactoryWithRecoveryKey.IdentityCreated({creator: nobody})
    // event.watch((error, result) => {
    //   if (error) throw Error(error)
    //   event.stopWatching()
    //   Check that event has addresses to correct contracts
    //   proxyAddress = result.args.proxy
    //   recoverableControllerAddress = result.args.controller
    //   let recoveryKeyInContract = result.args.recoveryKey

    //   assert.equal(web3.eth.getCode(proxyAddress),
    //                web3.eth.getCode(initProxy.address),
    //                'Created proxy should have correct code')
    //   assert.equal(web3.eth.getCode(recoverableControllerAddress),
    //                web3.eth.getCode(initRecoverableController.address),
    //                'Created controller should have correct code')
    //   assert.equal(recoveryKeyInContract, recoveryKey,
    //                'Created recoveryQuorum should have correct code')
    //   proxy = Proxy.at(proxyAddress)
    //   recoverableController = RecoverableController.at(result.args.controller)
    //   // Check that the mapping has correct proxy address
    //   deployedIdentityFactoryWithRecoveryKey.senderToProxy.call(nobody).then((createdProxyAddress) => {
    //     assert.equal(createdProxyAddress, proxy.address, "Mapping should have the same address as event");
    //     return deployedIdentityFactoryWithRecoveryKey.recoveryToProxy.call(recoveryKey)
    //   }).then((createdProxyAddress) => {
    //     assert.equal(createdProxyAddress, proxy.address, "Mapping should have the same address as event");
    //     done();
    //   }).catch(done);
    // });
    deployedIdentityFactoryWithRecoveryKey.CreateProxyWithControllerAndRecoveryKey(user1, recoveryKey, longTimeLock, shortTimeLock, {from: nobody}).then((result)=>{
       proxyAddress = result.logs[0].args.proxy
      recoverableControllerAddress = result.logs[0].args.controller
      let recoveryKeyInContract = result.logs[0].args.recoveryKey
      assert.equal(web3.eth.getCode(proxyAddress),
                   web3.eth.getCode(initProxy.address),
                   'Created proxy should have correct code')
      assert.equal(web3.eth.getCode(recoverableControllerAddress),
                   web3.eth.getCode(initRecoverableController.address),
                   'Created controller should have correct code')
      assert.equal(recoveryKeyInContract, recoveryKey,
                   'Created recoveryQuorum should have correct code')
      proxy = Proxy.at(proxyAddress)
      recoverableController = RecoverableController.at(result.logs[0].args.controller)
      // Check that the mapping has correct proxy address
      deployedIdentityFactoryWithRecoveryKey.senderToProxy.call(nobody).then((createdProxyAddress) => {
        assert.equal(createdProxyAddress, proxy.address, "Mapping should have the same address as event");
        return deployedIdentityFactoryWithRecoveryKey.recoveryToProxy.call(recoveryKey)
      }).then((createdProxyAddress) => {
        assert.equal(createdProxyAddress, proxy.address, "Mapping should have the same address as event");
        done();
      }).catch(done);
    })
  })

  it('Created proxy should have correct state', (done) => {
    proxy.owner.call().then((createdControllerAddress) => {
      assert.equal(createdControllerAddress, recoverableController.address)
      done()
    }).catch(done)
  })

  it('Created controller should have correct state', (done) => {
    recoverableController.proxy().then((_proxyAddress) => {
      assert.equal(_proxyAddress, proxy.address)
      return recoverableController.userKey()
    }).then((userKey) => {
      assert.equal(userKey, user1)
      return recoverableController.recoveryKey()
    }).then((rk) => {
      assert.equal(rk, recoveryKey)
      done()
    }).catch(done)
  })
})
