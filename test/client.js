const expect = require('chai').expect;
const Trust = require('../trust');
require('dotenv').config();

// WIP - Not working yet

describe('openraildata-trust tests', () => {
  describe('Create a new instance of trust client', () => {
    it('Expect a valid trust instance', () => {
      const testTrust = new Trust('testuser', 'testpass');
      expect(testTrust).to.be.an('object', 'Resultant should be an object');
      expect(testTrust.credentials.host).to.be.equal('datafeeds.networkrail.co.uk', 'instance host is incorrect');
      expect(testTrust.credentials.port).to.be.equal(61618, 'instance port is incorrect');
      expect(testTrust.credentials.connectHeaders.login).to.be.equal('testuser', 'instance has the incorrect username');
      expect(testTrust.credentials.connectHeaders.passcode).to.be.equal('testpass', 'instance has the incorrect username');
    });
    it('Expect an invalid trust instance', () => {
      const testTrust = new Trust();
      expect(testTrust).to.be.an('Object', 'Resultant should be an object');
      expect(testTrust.credentials.host).to.be.equal('datafeeds.networkrail.co.uk', 'instance host is incorrect');
      expect(testTrust.credentials.port).to.be.equal(61618, 'instance port is incorrect');
      expect(testTrust.credentials.connectHeaders.login).to.be.equal('', 'instance has not got an empty username');
      expect(testTrust.credentials.connectHeaders.passcode).to.be.equal('', 'instance has not got an empty password');
    });
  });

  describe('Testing trust.connect() functionality', () => {
    it('Are the envronment variables set?', () => {
      expect(process.env.ORDT_USER).to.be.an('string', 'environment variable ORDT_USER not set');
      expect(process.env.ORDT_USER).to.not.be.equal('', 'environment variable ORDT_USER is not valid');
      expect(process.env.ORDT_PASS).to.be.an('string', 'environment variable ORDT_PASS not set');
      expect(process.env.ORDT_PASS).to.not.be.equal('', 'environment variable ORDT_PASS is not valid');
    });
    it('Expects an error on attempting to connect to an invalid instance of trust (invalid client)', (done) => {
      const nvtrust = new Trust();
      nvtrust.connect((err) => {
        expect(err).to.be.an('object', 'Returned error should be an Object');
        expect(nvtrust.credentials.host).to.be.equal('datafeeds.networkrail.co.uk', 'instance host is incorrect');
        expect(nvtrust.credentials.port).to.be.equal(61618, 'instance port is incorrect');
        expect(nvtrust.credentials.connectHeaders.login).to.be.equal('', 'instance has not used an empty username');
        expect(nvtrust.credentials.connectHeaders.passcode).to.be.equal('', 'instance has not used an empty passcode');
        expect(nvtrust.client).to.be.equal(null, 'client variable should be null');
        expect(err.error).to.be.an('string', 'Returned error text should be a String');
        expect(err.error).to.be.equal('Invalid credentials', 'Returned error should be: "STOMP client was not initialised correctly"');
        done();
      });
    }).timeout(30000);
    it('Expects an error on attempting to connect to an invalid instance of trust (invalid settings)', (done) => {
      // set timeout for done function.
      const ivtrust = new Trust('uname', 'password');
      ivtrust.connect((err) => {
        expect(err).to.not.equal(null, 'An error should be returned');
        expect(ivtrust.credentials.host).to.be.equal('datafeeds.networkrail.co.uk', 'instance host is incorrect');
        expect(ivtrust.credentials.port).to.be.equal(61618, 'instance port is incorrect');
        expect(ivtrust.credentials.connectHeaders.login).to.be.equal('uname', 'instance has not used the invalid username');
        expect(ivtrust.credentials.connectHeaders.passcode).to.be.equal('password', 'instance has not used the invalid password');
        expect(ivtrust.client).to.be.equal(null, 'client variable should be null');
        done();
      });
    }).timeout(30000);
    it('Expected to connect to a valid instance of trust (valid client)', (done) => {
      const nvtrust = new Trust(process.env.ORDT_USER, process.env.ORDT_PASS);
      nvtrust.connect((err) => {
        expect(err).to.be.equal(null, `An error from the connect funtion was returned: ${err}`);
        expect(nvtrust.credentials.host).to.be.equal('datafeeds.networkrail.co.uk', 'instance host is incorrect');
        expect(nvtrust.credentials.port).to.be.equal(61618, 'instance port is incorrect');
        expect(nvtrust.credentials.connectHeaders.login).to.be.equal(process.env.ORDT_USER, 'instance has not used the invalid username');
        expect(nvtrust.credentials.connectHeaders.passcode).to.be.equal(process.env.ORDT_PASS, 'instance has not used the invalid password');
        expect(nvtrust.client).to.not.equal(null, 'client variable should be set');
        if (!err) {
          nvtrust.disconnect(); // close the client (assuming disconnect works)
        }
        done();
      });
    }).timeout(30000);
  });

  describe('Testing trust.subscribe() functionality', () => {
    it('Expects an error when trying to subscribe with an invalid client', (done) => {
      const trust = new Trust();
      trust.subscribe('TRAIN_MVT_ALL_TOC', (er) => {
        expect(er).to.be.an('object', 'Returned error should be an Object');
        expect(er.error).to.be.an('string', 'Returned error text should be a String');
        expect(er.error).to.be.equal('Unable to subscribe. Not connected to the TRUST server.', 'Returned error should be: "STOMP client was not initialised correctly"');
        done();
      });
    }).timeout(30000);
  });

  describe('Testing trust.disconnect() functionality', () => {
    it('Expects a null client when client is already null (no error)', (done) => {
      const trust = new Trust();
      expect(trust.client).to.be.equal(null, 'client should be null before disconnect');
      trust.disconnect((err) => {
        expect(err).to.be.equal(null, 'no error should be returned after disconnect');
        expect(trust.client).to.be.equal(null, 'client should be null after disconnect');
        done();
      });
    }).timeout(10000);
    it('Expects a null client when client is not already null (no error)', (done) => {
      const trust = new Trust(process.env.ORDT_USER, process.env.ORDT_PASS);
      trust.connect(() => {
        expect(trust.client).to.not.equal(null, 'client should not be null before disconnect');
        trust.disconnect((err) => {
          expect(err).to.be.equal(null, 'no error should be returned after disconnect');
          expect(trust.client).to.be.equal(null, 'client should be null after disconnect');
          done();
        });
      });
    }).timeout(10000);
    it('Expects a null client when client is not already null with 3 second delay(no error)', (done) => {
      const trust = new Trust(process.env.ORDT_USER, process.env.ORDT_PASS);
      trust.connect(() => {
        expect(trust.client).to.not.equal(null, 'client should not be null before disconnect');
        const timeBefore = Date.now();
        trust.disconnect(3000, (err) => {
          const timeAfter = Date.now();
          const timeDiff = timeAfter - timeBefore;
          expect(err).to.be.equal(null, 'no error should be returned after disconnect');
          expect(trust.client).to.be.equal(null, 'client should be null after disconnect');
          expect((timeDiff >= 3000)).to.be.equal(true, 'Time difference expected to be over 3000ms');
          expect((timeDiff <= 9500)).to.be.equal(true, 'Time difference expected to be under 9500ms');
          done();
        });
      });
    }).timeout(10000);
  });
});
