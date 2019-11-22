const app = require('commander');
const fs = require('fs');
const path = require('path');
const Hapi = require('@hapi/hapi');
const orchestrator = require('./vote-orchestrator');
const twitch = require('./util/twitch-helper');

//*****************************************************************************
//*App Config                                                              *
//*****************************************************************************

// The developer rig uses self-signed certificates.  Node doesn't accept them
// by default.  Do not use this in production.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

app
    .version(require('../package.json').version)
    .option('-s, --secret <secret>', 'Extension secret')
    .option('-c, --client-id <client_id>', 'Extension client ID')
    .option('-o, --owner-id <owner_id>', 'Extension owner ID')
    .parse(process.argv);

const ownerId = getOption('ownerId', 'EXT_OWNER_ID');
const secret = Buffer.from(getOption('secret', 'EXT_SECRET'), 'base64');
const clientId = getOption('clientId', 'EXT_CLIENT_ID');

twitch.setClientId(clientId);
twitch.setSecret(secret);
twitch.setOwnerId(ownerId);

// Borrowing this function from Twitch demos
// Gets options from the command line or the environment.
function getOption(optionName, environmentName) {
  const option = (() => {
    if (app[optionName]) {
      return app[optionName];
    } else if (process.env[environmentName]) {
      return process.env[environmentName];
    }
    console.log(optionName + ' is missing');
    process.exit(1);
  })();
  //console.log(`Using "${option}" for ${optionName}`); //DEV ONLY
  return option;
}



//*****************************************************************************
//*Server Config                                                              *
//*****************************************************************************

//let userCooldowns = {};                     // spam prevention
//const userCooldownMs = 1000;                // maximum input rate per user to prevent bot abuse
//const userCooldownClearIntervalMs = 60000;  // interval to reset our tracking object

const serverOptions = {
  host: 'localhost',
  port: 8081,
  routes: {
    cors: {
      origin: ['*'],
    },
  }
};

const server = new Hapi.Server(serverOptions);

(async () => {

  // Handle the start of a vote
  server.route({
    method: 'POST',
    path: '/begin-vote',
    handler: beginVoteHandler,
  });

  // Handle the start of a vote
  server.route({
    method: 'POST',
    path: '/cast-vote',
    handler: castVoteHandler,
  });
  
  // Handle the start of a vote
  server.route({
    method: 'POST',
    path: '/broadcast-url',
    handler: broadcastUrlHandler,
  });
  
  // Start the server.
  await server.start();
  console.log('Server running at %s', server.info.uri);

  // Periodically clear cool-down tracking to prevent unbounded growth due to
  // per-session logged-out user tokens.
  //setInterval(() => { userCooldowns = {}; }, userCooldownClearIntervalMs);
})();

function beginVoteHandler(request) {
    orchestrator.initVoting(twitch.verifyAndDecodeRequest(request, secret)); //async
    //API requires a response of some kind. TODO: fix this
    return 'yes';
}

function castVoteHandler(request) {
    return orchestrator.castVote(
        twitch.verifyAndDecodeRequest(request, secret)
    );
}

function broadcastUrlHandler(request) {
    twitch.broadcastUrl(twitch.verifyAndDecodeRequest(request, secret)); //async
    //API requires a response of some kind. TODO: fix this
    return 'yes';
}
	