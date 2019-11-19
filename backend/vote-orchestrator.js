const twitch = require('./util/twitch-helper.js');
const lor = require('./util/runeterra-helper.js');

var timer;
var cooldown;
const apiCooldownMs = 3000;
const channelCooldownMs = 1000;

var voteEndTimeout;
var voteCountUpdateTimeout;
var cardCheckerInterval;

var votes = new Map();
var currentSelection = {};

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
function initVoting(payload) {
    setInterval(detectNewCards, apiCooldownMs, payload.apiUrl, payload.voteDuration);	
}

async function detectNewCards(apiUrl, voteDuration) {
    //get draft type and determine current card selection
    draftType = await lor.getDraftType(apiUrl);
    var cardsOnScreen = {};
    
    if(draftType == 'picking') {
        cardsOnScreen = await lor.getPickingOptions(apiUrl);
        if(cardsOnScreen.left.top == "" || cardsOnScreen.middle.top == "") {
        	//hack solution to hitting API while the
        	//selection animation is playing
            return;
        } 
    } else if(draftType == 'swapping') {
        cardsOnScreen = await lor.getSwappingOptions(apiUrl);
        if(cardsOnScreen.top.left == "" || cardsOnScreen.middle.left == "") {
        	//hack solution to hitting API while the
        	//selection animation is playing
            return;
        }
    } else {
        if(Object.getOwnPropertyNames(currentSelection).length != 0) {
            endVote();
        }
        return; //Do nothing! No vote here!
    }
    
    if(!lor.hasSameCards(cardsOnScreen, currentSelection)) { //START A NEW VOTE ************
        currentSelection = cardsOnScreen;
        beginVote(voteDuration, draftType);
    }
    
}

function beginVote(voteDuration, draftType) {
    endVote();
    
    console.log("Starting new vote!");
    console.log(currentSelection);
    
    //broadcast 'vote-start' event then begin a countdown until broadcasting
    //'vote-end' event
    twitch.broadcastObject('vote-start', {draftType: draftType});
    
    if(voteDuration > 0) {
        voteEndTimeout = setTimeout(endVote, voteDuration * 1000);
    }
    voteCountUpdateTimeout = setTimeout(sendVoteCountUpdate, channelCooldownMs, voteDuration);
}

function endVote() {
    //end any vote timers currently running and broadcast 'vote-end' to viewers
    if(voteEndTimeout) {
        console.log(countVotes());
	    voteEndTimeout = null;
        clearTimeout(voteEndTimeout);
        voteEndTimeout = null;
        twitch.broadcastObject('vote-end', countVotes());
    }
    if(voteCountUpdateTimeout) { clearTimeout(voteCountUpdateTimeout); voteCountUpdateTimeout = null; }
}



//*****************************************************************************
//* Process cast ballots                                                      *
//*****************************************************************************


function sendVoteCountUpdate(remainingDuration) {
	remainingDuration--;
	tally = getVotes();
	voteCount = {
		option1 : tally.get('option1'),
		option2 : tally.get('option2'),
		option3 : tally.get('option3'),
		option4 : tally.get('option4')
	};
    twitch.broadcastObject('vote-count-update', voteCount);
    if(remainingDuration != 0) {
        voteCountUpdateTimeout = setTimeout(sendVoteCountUpdate, channelCooldownMs, remainingDuration);
    } else {
        voteCountUpdateTimeout = null;
    }
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


module.exports = {initVoting, castVote}