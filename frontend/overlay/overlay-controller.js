angular
    .module('app', [])
    .controller('ctrl', ctrl);

function ctrl($scope) {

    var twitch = window.Twitch.ext;

    var context = ""; //we save this because it has viewer latency info in it
    var token = "";
    var userId = "";
    var ebsUrl = "";
    var notloaded = true;

    // Simple object to track the user's current vote    
    pickButtonIds = function() { return vote.pickButtonIds; };
    swapButtonIds = function() { return vote.swapButtonIds; };
    allButtonIds = function() { return vote.pickButtonIds.concat(vote.swapButtonIds); };
    pickButtonTextIds = function() { return vote.pickButtonIds.map(text => text + 'Text'); };
    swapButtonTextIds = function() { return vote.swapButtonIds.map(text => text + 'Text'); };
    allButtonTextIds = function() { return pickButtonTextIds().concat(swapButtonTextIds()); };
    
    var vote = {
        selectedVote: '',
        pickButtonIds: ['option1pick', 'option2pick', 'option3pick'],
        swapButtonIds: ['option1swap', 'option2swap', 'option3swap', 'option4swap']
    };
    
    getButtonType = function(str) { return str.substring(7); } //pick or swap
    getButtonOption = function(str) { return str.substring(0, 7); } // 1, 2, 3, or 4
    
    setVisibility = function(id, visibility) { document.getElementById(id).style.visibility = visibility; }

    //https://dev.twitch.tv/docs/extensions/reference/#oncontext
    twitch.onContext(function (contextVar) {
        if(notloaded) {
            clearScreen();
            notloaded = false;
        }
        context = contextVar;
    });

    twitch.onAuthorized(function (auth) {
        token = auth.token;
        userId = auth.userId

        if (userId.charAt(0) === "A") {
            twitch.actions.requestIdShare(); //this is how we get usernames for Anarchy votes
        } else { /*???*/ }
    });
    
    $(function() {
        twitch.listen('broadcast', broadcastHandler);
    });

    createCastVoteRequest = function (voteOption) {
        return {
            type: 'POST',
            url: ebsUrl + '/cast-vote',
            headers: {
                'Authorization': 'Bearer ' + token
            },
            data: {
                voteOption: voteOption
            }
        }
    };
    
    $

    broadcastHandler = function(target, contentType, message) {
        obj = JSON.parse(message);

        //$('#debug').text(obj.object.draftType);
        //vote-start handler
        if (obj.type == 'vote-start') {
        	//Count should be returned from the API 
            $scope.count1 = 0;
            $scope.count2 = 0;
            $scope.count3 = 0;
            $scope.count4 = 0;
            resetAllImages();
            
            delay = context.hlsLatencyBroadcaster ? context.hlsLatencyBroadcaster * 1000 : 0; //reveal voting div after latency delay
            if (obj.object.draftType == 'picking') {
                beginDraftScreen();
            } else if (obj.object.draftType == 'swapping') {
                beginSwapScreen();
            }

        //vote-end handler
        } else if (obj.type == 'vote-end') {
            //immediately deactivate voting and show results
            clearScreen();
        
        //vote-count-update handler
        } else if (obj.type == 'vote-count-update') {
            //delay = context.hlsLatencyBroadcaster ? context.hlsLatencyBroadcaster * 1000 : 0; //reveal voting div after latency delay
            $scope.count1 = obj.object.option1;
            $scope.count2 = obj.object.option2;
            $scope.count3 = obj.object.option3;
            $scope.count4 = obj.object.option4;

            //immediately deactivate voting and show results
            // $('#vote-div').text(obj.object.winner + ' wins!');
        } else if (obj.type == 'broadcast-url') {
            if(ebsUrl != obj.object.ebsUrl) {
                ebsUrl = obj.object.ebsUrl;
            }
        }
    }

    //Casts the vote to the backend
    castVote = function (selectedOption) {
        if (!token) { return twitch.rig.log('Not authorized'); }
        $.ajax(createCastVoteRequest(selectedOption));
    };
    
    //Actives the "Swap" screen
    beginSwapScreen = function () {
    	swapButtonIds().map(button => setVisibility(button, "visible"));
    	swapButtonTextIds().map(text => setVisibility(text, "visible"));
        setVisibility("swapText", "visible");
        // document.body.style.backgroundImage = "url('https://i.imgur.com/rYhnUQO.png')";
    };
    
    // Actives the "Draft" screen
    beginDraftScreen = function () {
        pickButtonIds().map(button => setVisibility(button, "visible"));
        pickButtonTextIds().map(text => setVisibility(text, "visible"));
        setVisibility("pickText", "visible");
        // document.body.style.backgroundImage = "url('https://i.imgur.com/QMdaXFG.jpg')";
    };

    //Clears all UI from the screen
    clearScreen = function() {
        vote.selectedVote = "";
        resetAllImages();
        allButtonTextIds().map(text => setVisibility(text, "hidden"));
        allButtonIds().map(button => setVisibility(button, "hidden"));
        setVisibility("pickText", "hidden");
        setVisibility("swapText", "hidden");
    };
    
    //Triggered when you mouseover. 
    $scope.hoverImage = function (ID) {
        if (vote.selectedVote != ID) {
            if (getButtonType(ID) === 'swap') {
                document.getElementById(ID).style.backgroundImage = "url(assets/TPEVoteSwapActive.png)";
            } else if (getButtonType(ID) === 'pick') {
                document.getElementById(ID).style.backgroundImage = "url(assets/TPEVoteDraftActive.png)";
            }
        }
    };
    
    //Triggered when your mouse leaves the button
    $scope.leftImage = function (ID) {
        if (vote.selectedVote != ID) {
            if (getButtonType(ID) === 'swap') {
                document.getElementById(ID).style.backgroundImage = "url(assets/TPEVoteSwapInactive.png)";
            } else if (getButtonType(ID) === 'pick') {
                document.getElementById(ID).style.backgroundImage = "url(assets/TPEVoteDraftInactive.png)";
            }
        }
    };
    
    //Resets all images to "inactive" 
    resetAllImages = function () {
        swapButtonIds().map(button => document.getElementById(button).style.backgroundImage = "url(assets/TPEVoteSwapInactive.png)");
        pickButtonIds().map(button => document.getElementById(button).style.backgroundImage = "url(assets/TPEVoteDraftInactive.png)");
    };
    
    //Does the "make it green" magic
    $scope.clickImage = function (clickedID) {
    	resetAllImages();
    	
    	if(vote.selectedVote != "") {
    	    if(getButtonOption(vote.selectedVote) === 'option1') { $scope.count1--; }
            if(getButtonOption(vote.selectedVote) === 'option2') { $scope.count2--; }
            if(getButtonOption(vote.selectedVote) === 'option3') { $scope.count3--; }
            if(getButtonOption(vote.selectedVote) === 'option4') { $scope.count4--; }
    	}
        
        //log vote
        vote.selectedVote = clickedID;
        voteOption = getButtonOption(clickedID)
        castVote(voteOption);
        
        if(voteOption === 'option1') { $scope.count1++; }
        if(voteOption === 'option2') { $scope.count2++; }
        if(voteOption === 'option3') { $scope.count3++; }
        if(voteOption === 'option4') { $scope.count4++; }
        
        //update image
        if(getButtonType(clickedID) == 'pick') {
            document.getElementById(clickedID).style.backgroundImage = "url(assets/TPEVoteDraftSelected.png)";
        } else if(getButtonType(clickedID) == 'swap') {
            document.getElementById(clickedID).style.backgroundImage = "url(assets/TPEVoteSwapSelected.png)";
        }
    }
    
}

