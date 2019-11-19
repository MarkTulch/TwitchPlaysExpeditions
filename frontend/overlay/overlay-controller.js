angular
    .module('app', [])
    .controller('ctrl', ctrl);

function ctrl($scope) {

    var twitch = window.Twitch.ext;

    var context = ""; //we save this because it has viewer latency info in it
    var token = "";
    var userId = "";


    // Hard-coded marker for where the end of "swapStage" positions is in the vote.ids array. I'm sorry 
    var swapStageMarker = 4;
    // Simple object to track the user's current vote
    var vote = {
        selectedVote: '',
        // This is so hard coded that this ordering matters (check the Set Visible function)  
        ids: ['posOne', 'posTwo', 'posThree', 'posSeven', 'posFour', 'posFive', 'posSix'],
        textFields: ['posOneText', 'posTwoText', 'posThreeText', 'posFourText', 'posFiveText', 'posSixText', 'posSevenText']
    };

    //Count should be returned from the API 
    $scope.count1 = 38;
    $scope.count2 = 10;
    $scope.count3 = 4;


    //https://dev.twitch.tv/docs/extensions/reference/#oncontext
    twitch.onContext(function (contextVar) {
        context = contextVar;
    });

    twitch.onAuthorized(function (auth) {
        token = auth.token;
        userId = auth.userId

        if (userId.charAt(0) === "A") {
            twitch.actions.requestIdShare(); //this is how we get usernames for Anarchy votes
        } else { /*???*/ }
    });

    createCastVoteRequest = function (voteOption) {
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
    };

    broadcastHandler = function(target, contentType, message) {
        obj = JSON.parse(message);

        $('#debug').text(obj.object.draftType);
        //vote-start handler
        if (obj.type == 'vote-start') {
            delay = context.hlsLatencyBroadcaster ? context.hlsLatencyBroadcaster * 1000 : 0; //reveal voting div after latency delay
            if (obj.object.draftType == 'picking') {
                draftScreen();
            } else if (obj.object.draftType == 'swapping') {
                swapScreen();
            }

            //vote-end handler
        } else if (obj.type == 'vote-end') {
            //immediately deactivate voting and show results
           clearScreen();
            //vote-count-update handler
        } else if (obj.type == 'vote-count-update') {
            delay = context.hlsLatencyBroadcaster ? context.hlsLatencyBroadcaster * 1000 : 0; //reveal voting div after latency delay
            setTimeout(() => {
                $scope.count1 = obj.object.option1;
                $scope.count2 = obj.object.option2;
                $scope.count3 = obj.object.option3;
            }, delay)

            //immediately deactivate voting and show results
            // $('#vote-div').text(obj.object.winner + ' wins!');
        }
    }

    //Casts the vote to the backend
    castVote = function () {
        if (!token) { return twitch.rig.log('Not authorized'); }
        optionStrings = ['option1','option1','option1','option1'];
        $.ajax(createCastVoteRequest(optionStrings[option]));
        twitch.listen('broadcast', broadcastHandler);
    };

    //Actives the "Swap" screen
    swapScreen = function () {
        setVisible(0, swapStageMarker);
        setTextVisible(['posOneText', 'posTwoText', 'posThreeText', 'posSevenText']);
        document.getElementById("castVoteSwap").style.visibility = "visible"; document.body.style.backgroundImage = "url('https://i.imgur.com/rYhnUQO.png')";
    };

    // Actives the "Draft" screen
    draftScreen = function () {
        setVisible(swapStageMarker, vote.ids.length);
        setTextVisible(['posFourText', 'posFiveText', 'posSixText']);
        document.body.style.backgroundImage = "url('https://i.imgur.com/QMdaXFG.jpg')";
        document.getElementById("castVoteDraft").style.visibility = "visible";
    };

    //Sets visible swap (0-2) or draft (3-5) vote buttons
    setVisible = function (min, max) {
        clearScreen();
        for (var i = min; i < max; i++) {
            document.getElementById(vote.ids[i]).style.visibility = "visible";
        }
    };

    // This method is horrible and I'm sorry for writing it. It requires an array in the style of "['posOneText','posTwoText','posThreeText']" for Swap Stage, "['posFourText','posFiveText','posSixText']" for Draft stage, or empty for clearing completely. 
    setTextVisible = function (numbersToSetVisible) {
        for (var i = 0; i < vote.textFields.length; i++) {
            var thisIsAUselessVariable = numbersToSetVisible.includes(vote.textFields[i]) ? document.getElementById(vote.textFields[i]).style.visibility = "visible" : document.getElementById(vote.textFields[i]).style.visibility = "hidden";
        }
    }

    //Clears all UI from the screen
    clearScreen = function () {
        vote.selectedVote = "";
        resetAllImages();
        setTextVisible([]);
        for (var i = 0; i < vote.ids.length; i++) {
            document.getElementById(vote.ids[i]).style.visibility = "hidden";
        }
        document.getElementById("castVoteDraft").style.visibility = "hidden";
        document.getElementById("castVoteSwap").style.visibility = "hidden";
        document.body.style.backgroundImage = "url('')";
    };
    //Triggered when you mouseover. 
    $scope.hoverImage = function (ID) {
        if (vote.selectedVote != ID) {
            if (vote.ids.indexOf(ID) < swapStageMarker) {
                document.getElementById(ID).style.backgroundImage = "url('https://i.imgur.com/tVBD12D.png')";
            } else {
                document.getElementById(ID).style.backgroundImage = "url('https://i.imgur.com/FGdmRNV.png')";
            }
        }
    };

    //Triggered when your mouse leaves the button
    $scope.leftImage = function (ID) {
        if (vote.selectedVote != ID) {
            if (vote.ids.indexOf(ID) < swapStageMarker) {
                document.getElementById(ID).style.backgroundImage = "url('https://i.imgur.com/uDhHFY6.png')";
            } else {
                document.getElementById(ID).style.backgroundImage = "url('https://i.imgur.com/0QzcWSZ.png')";
            }
        }
    };

    //Resets all images to "inactive" 
    resetAllImages = function () {
        for (var i = 0; i < vote.ids.length; i++) {
            if (vote.ids.indexOf(vote.ids[i]) < swapStageMarker) {
                document.getElementById(vote.ids[i]).style.backgroundImage = "url('https://i.imgur.com/uDhHFY6.png')";
            } else {
                document.getElementById(vote.ids[i]).style.backgroundImage = "url('https://i.imgur.com/0QzcWSZ.png')";
            }
        }
    };
    //Does the "make it green" magic
    $scope.clickImage = function (clickedID) {
        resetAllImages();
        for (var i = 0; i < vote.ids.length; i++) {
            if (clickedID == vote.ids[i]) {
                vote.selectedVote = clickedID;
                if (vote.ids.indexOf(clickedID) < swapStageMarker) {
                    document.getElementById(vote.ids[i]).style.backgroundImage = "url('https://i.imgur.com/PcTvxL4.png')";
                } else {
                    document.getElementById(vote.ids[i]).style.backgroundImage = "url('https://i.imgur.com/JMWmxcZ.png')";
                }
            }
        }
    }

    getVoteNumber = function() {
        var index = (vote.ids.indexOf(vote.selectedVote)%4)+1;
        return index;
    };
}

