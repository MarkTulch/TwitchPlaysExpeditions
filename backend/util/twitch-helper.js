const jwt = require('jsonwebtoken');
const request = require('request');

//*****************************************************************************
//* Everything Twitch Helper                                                  *
//*****************************************************************************

const serverTokenDuration = 30 //tokens last 30 seconds

clientId = "";
secret = "";
ownerId = "";
channelId = "";

function setClientId(clientIdVar) {
    clientId = clientIdVar;
}

function setSecret(secretVar) {
    secret = secretVar;
}

function setOwnerId(ownerIdVar) {
    ownerId = ownerIdVar;
}

//schema of the JWT object can be found here: https://dev.twitch.tv/docs/extensions/reference#jwt-schema
//Any message we get will have the JWT object added to payload

function verifyAndDecodeRequest(request) {
    data = request.payload
    data.jwt = jwt.verify(request.headers.authorization.substring(7), secret, { algorithms: ['HS256'] });
    if ( channelId == "") {
        channelId = data.jwt.channel_id;
    }
    return data;
}

function broadcastObject(type, obj) {
<<<<<<< Updated upstream
	//console.log(clientId);
=======
>>>>>>> Stashed changes
    const broadcastHeaders = {
        'Client-ID': clientId,
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + createSignedToken(),
    };
    
    const broadcastBody = JSON.stringify({
        content_type: 'application/json',
        message: JSON.stringify({
            type: type,
            object: obj
        }),
        targets: ['broadcast'],
    });
    
    request(
    `https://api.twitch.tv/extensions/message/${channelId}`,
    {
        method: 'POST',
        headers: broadcastHeaders,
        body: broadcastBody,
    }
    );
}

function createSignedToken(){
    const payload = {
        exp: Math.floor(Date.now() / 1000) + serverTokenDuration,
        channel_id: channelId,
        user_id: ownerId, // extension owner ID for the call to Twitch PubSub
        role: 'external',
        pubsub_perms: {
            send: ['*'],
        },
    };
    return jwt.sign(payload, secret, { algorithm: 'HS256' });
}

module.exports = {setClientId, setSecret, setOwnerId, broadcastObject, verifyAndDecodeRequest}