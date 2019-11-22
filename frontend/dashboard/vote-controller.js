var twitch = window.Twitch.ext;

var token = "";
var tuid = "";
var ebsUrl = "";

//https://dev.twitch.tv/docs/extensions/reference/#oncontext
twitch.onContext(function(context) {
    twitch.actions.requestIdShare();
    twitch.rig.log(context);
});

//https://dev.twitch.tv/docs/extensions/reference/#onauthorized
twitch.onAuthorized(function(auth) {
    token = auth.token;       //required for twitch API requests
    tuid = auth.userId;       //not doing anything with broadcaster ID rn
    
    $('#api-host').removeAttr('disabled');
    $('#vote-seconds').removeAttr('disabled');
    $('#update-config').removeAttr('disabled');
});

function createBeginVoteRequest(token,  voteDuration) {
	if(ebsUrl != ""){
	    return {
	        type: 'POST',
            url: ebsUrl + '/begin-vote',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                apiUrl: 'http://localhost:21337',
                voteDuration: voteDuration
            }
        }
    }
    return;
}

function createBroadcastUrlRequest(token, ebsUrl) {
    return {
	    type: 'POST',
        url: ebsUrl + '/broadcast-url',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: {
            ebsUrl: ebsUrl
        }
    }
}

function broadcastHandler(target, contentType, message) {
    payload = JSON.parse(message);
    
    if(payload.type === 'vote-count-update') {
        $('#results1').text("Option 1: " + payload.object.option1);
        $('#results2').text("Option 2: " + payload.object.option2);
        $('#results3').text("Option 3: " + payload.object.option3);
        $('#results4').text("Option 4: " + payload.object.option4);
    }
}

$(function() {

    $('#begin-vote').click(function() { //when the Begin Vote button is clicked
        if(!token) { return twitch.rig.log('Not authorized'); }
        twitch.rig.log('"Begin Vote" button clicked');
        $.ajax(createBeginVoteRequest(
            token,                                    //required auth token
            $('#vote-seconds').val()                  //Vote duration
        ))
    });
    
    $('#update-config').click(function() {
        if(!token) { return twitch.rig.log('Not authorized'); }
        $('#begin-vote').removeAttr('disabled');
        ebsUrl = $('#api-host').val();
        $.ajax(createBroadcastUrlRequest(
            token,                                    //required auth token
            $('#api-host').val()                      //API Host URL for EBS
        ));
    });
    
    twitch.listen('broadcast', broadcastHandler);

});
