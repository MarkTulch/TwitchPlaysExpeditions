const twitch = require('./util/twitch-helper.js');
const lor = require('./util/runeterra-helper.js');

var timer;
var cooldown;
const channelCooldownMs = 1000;     
var votes = new Map();

//NOTE for Mark and Karan:
// I have written a twitch-helper file to help with communicating with Twitch.
// The important thing you need to know is there is a method that you can call
// called "broadcastObject(string, object)". I wrote it with the intent of us
// using it to broadcast messages back to the front-end. Messages will have a
// "type" field which is the string you pass, and a "object" field which can be
// anything. Right now, I've got message types "vote-start" and "vote-end," and
// my listeners in the front-end first check what the "broadcast type" is before
// appropriately handling the message. Use this functionality
// to your advantage.




//*****************************************************************************
//* Main Vote Orchestrator                                                    *
//*****************************************************************************
async function beginVote(payload) {
    draftType = await lor.getDraftType(payload.apiUrl);
    console.log('Draft type is: ' + draftType);
    if(draftType == 'picking') {
        pickingCards = await lor.getPickingOptions(payload.apiUrl);
		console.log(pickingCards);
		
    } else if(draftType == 'swapping') {
        //TODO
    }
	
	//broadcast 'vote-start' event then begin a countdown until broadcasting
	//'vote-end' event
	twitch.broadcastObject('vote-start', {draftType : draftType});
	
	

	setTimeout(voteEnd, payload.voteDuration * 1000);
	// for (i=1;i<payload.voteDuration;i++){
	// 	setTimeout(sendVoteCountUpdate, i*channelCooldownMs);
	// }
	
}

//broadcast 'vote-end' event
function voteEnd() {
	console.log(countVotes());
    twitch.broadcastObject('vote-end', countVotes());
}

function sendVoteCountUpdate() {

	tally = getVotes();
	voteCount = {
		option1 : tally.get('option1'),
		option2 : tally.get('option2'),
		option3 : tally.get('option3')
	};
    twitch.broadcastObject('vote-count-update', voteCount);
}

//These functions are still super rough. Can come back to them if they don't
//work right
function castVote(payload) {
    votes.set(payload.jwt.opaque_user_id, payload.voteOption);
    return 'yes'
}

function countVotes() {
	var max = 0;
	var winner = "";
	tally = getVotes();
	for (var key of tally.keys()) {
	    if(tally.get(key) > max) {
	        max = tally.get(key);
	        winner = key;
	    }
	}
	console.log({winner: winner});
	return { winner: winner };
}

function getVotes() {
	tally = new Map();
	tally.set('option1',0);
	tally.set('option2',0);
	tally.set('option3',0);
	tally.set('option4',0);

	for (var [user, vote] of votes.entries()) {
	    if(tally.has(vote)) {
	        tally.set(vote, tally.get(vote) + 1);
	    } else {
	        tally.set(vote, 1);
	    }
	}
	return tally;
}


module.exports = {beginVote, castVote}