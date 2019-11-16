var twitch = window.Twitch.ext;

var context = ""; //we save this because it has viewer latency info in it
var token = "";
var userId = "";

//https://dev.twitch.tv/docs/extensions/reference/#oncontext
twitch.onContext(function(contextVar) {
    context = contextVar;
});

twitch.onAuthorized(function(auth) {
	token = auth.token;
    userId = auth.userId
    
    if(userId.charAt(0) === "A"){
        twitch.actions.requestIdShare(); //this is how we get usernames for Anarchy votes
    } else { /*???*/ }
});

function createCastVoteRequest(voteOption) {
    return {
        type: 'POST',
        url: location.protocol + '//localhost:8081/cast-vote',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: {
            voteOption: voteOption
        }
    }
}

function broadcastHandler(target, contentType, message) {
    obj = JSON.parse(message);
    
    //vote-start handler
    if(obj.type == 'vote-start') {
        delay = context.hlsLatencyBroadcaster ? context.hlsLatencyBroadcaster * 1000 : 0; //reveal voting div after latency delay
        setTimeout(() => {$('#vote-div').css('display',  'block');}, delay)
    
    //vote-end handler
    } else if(obj.type == 'vote-end') {
        //immediately deactivate voting and show results
        $('#vote-div').text(obj.object.winner + ' wins!');
    }
}

$(function() {
	
	$('#option1').click(function() {
        if(!token) { return twitch.rig.log('Not authorized'); }
        $.ajax(createCastVoteRequest('option1'));
    });
	
	$('#option2').click(function() {
        if(!token) { return twitch.rig.log('Not authorized'); }
        $.ajax(createCastVoteRequest('option2'));
    });
	
	$('#option3').click(function() {
        if(!token) { return twitch.rig.log('Not authorized'); }
        $.ajax(createCastVoteRequest('option3'));
    });
    
    twitch.listen('broadcast', broadcastHandler);

});
