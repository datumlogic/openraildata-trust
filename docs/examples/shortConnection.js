/**
 * Simple example code for connecting to trust server
 *
 * This example will use the users datafeeds.networkrail.co.uk credentials
 * which are stored in an environment variable (must be set) to connect to
 * the Network Rail Trust server (assuming the user has an account) and attempts
 * to subscribe to all train movement data (This requires you to subscribe to
 * this server on the 'My Feeds' section on datafeeds.networkrail.co.uk).
 *
 * This also demos the automatic disconnection from the server with a 30
 * second delay
 */

'use strict';

const Trust = require('openraildata-trust');
// required for storing username and password in environment file
require('dotenv').config();

// initialise an instance
const trust = new Trust(process.env.ORDT_USER, process.env.ORDT_PASS);

// (optional) Will stay connected for up to 30 seconds (assuming a successful connection)
// to disconnect now use 'trust.disconnect();'
trust.disconnect(30000);

// attempt to connect to trust
trust.connect((err) => {
  if (!err) {
    // on successful connection subscribe to the TRAIN_MVT_ALL_TOC topic
    trust.subscribe('TRAIN_MVT_ALL_TOC', (er, msg) => {
      if (!er) {
        // process message here
        console.log(msg);
      }
    });
  }
});
