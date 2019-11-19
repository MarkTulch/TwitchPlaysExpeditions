var twitch = window.Twitch.ext;

var token = "";
var tuid = "";

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
    $('#democracy').removeAttr('disabled');
    $('#anarchy').removeAttr('disabled');
    $('#vote-seconds').removeAttr('disabled');
    $('#begin-vote').removeAttr('disabled');
});

function createBeginVoteRequest(token, apiUrl, voteType, voteDuration) {
	return {
	    type: 'POST',
        url: location.protocol + '//localhost:8081/begin-vote',
        headers: {
            'Authorization': 'Bearer ' + token
        },
        data: {
            apiUrl: apiUrl,
            voteType: voteType,
            voteDuration: voteDuration
        }
    }
}

$(function() {

    $('#begin-vote').click(function() { //when the Begin Vote button is clicked
        if(!token) { return twitch.rig.log('Not authorized'); }
        twitch.rig.log('"Begin Vote" button clicked');
        $.ajax(createBeginVoteRequest(
            token,                                    //required auth token
            $('#api-host').val(),                     //API Host URL for LoR
            $('input[name=vote-type]:checked').val(), //Deomcracy or Anarchy
            $('#vote-seconds').val()                  //Vote duration
        ))
    });
    
    twitch.listen('broadcast', function (target, contentType, message) {
        //twitch.rig.log('broadcast received');
        //TODO: add handlers for broadcaster to deal with different types
        //      broadcast messages
    });

});
