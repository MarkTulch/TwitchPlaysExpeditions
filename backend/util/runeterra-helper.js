const request = require('request');

//*****************************************************************************
//* Legends of Runeterra API Helper                                           *
//*****************************************************************************

//Gets current draft type, but only if "Picking" or "Swapping"
//
//request GET is async, so this weird await-promise model forces
//our other code to wait on this result
function getDraftType(apiUrl) {
    return new Promise(resolve => {
        request(apiUrl + '/expeditions-state', function (error, response, body) {
            if(!error) {
                state = JSON.parse(body).State.toLowerCase().trim();
                if(state == 'picking' || state == 'swapping') {
                    console.log('setting runeterraState to ' + state);
                    resolve(state); //basically a return value
                } else {
                    console.log('Wrong state: ', state); //TODO: give broadcaster error
                }
            } else {
                console.error(error); //TODO: give broadcaster error
                resolve(null); //basically return null
            }
        });
    });
}

//Return the cards when doing a draft
function getPickingOptions(apiUrl) {
	return new Promise(resolve => {
	    request(apiUrl + '/positional-rectangles', function (error, response, body) {
            if(!error) {
                returnObj = {
                    left: {
                        top: "",
                        middle: "",
                        bottom: ""
                    },
                    middle: {
                        top: "",
                        middle: "",
                        bottom: ""
                    },
                    right: {
                        top: "",
                        middle: "",
                        bottom: ""
                    }
                };
                rectangles = JSON.parse(body).Rectangles;
                xPosArray = [];
                yPosArray = [];

                console.log(JSON.parse(body).Rectangles);
                
                //super sub-optimal sorting, but it's only 9 cards who cares
                for (var card of rectangles) {
                    xPosArray.push(card.TopLeftX);
                    yPosArray.push(card.TopLeftY);
                }
                xPosArray.sort((a,b) => a-b);
                yPosArray.sort((a,b) => a-b);
        
                for (var card of rectangles) {
                    if(card.TopLeftX == xPosArray[0]) {
                        if(card.TopLeftY == yPosArray[0]) {
                        	returnObj.left.bottom = card.CardCode;
                        } else if(card.TopLeftY == yPosArray[3]) {
                        	returnObj.left.middle = card.CardCode;
                        } else if(card.TopLeftY == yPosArray[6]) {
                        	returnObj.left.top = card.CardCode;
                        }
                    } else if(card.TopLeftX == xPosArray[3]) {
                        if(card.TopLeftY == yPosArray[0]) {
                        	returnObj.middle.bottom = card.CardCode;
                        } else if(card.TopLeftY == yPosArray[3]) {
                        	returnObj.middle.middle = card.CardCode;
                        } else if(card.TopLeftY == yPosArray[6]) {
                        	returnObj.middle.top = card.CardCode;
                        }
                    } else if(card.TopLeftX == xPosArray[6]) {
                        if(card.TopLeftY == yPosArray[0]) {
                        	returnObj.right.bottom = card.CardCode;
                        } else if(card.TopLeftY == yPosArray[3]) {
                        	returnObj.right.middle = card.CardCode;
                        } else if(card.TopLeftY == yPosArray[6]) {
                        	returnObj.right.top = card.CardCode;
                        }
                    }
                }
                
                resolve(returnObj);
            } else {
                console.log('error getting rectangles');
                resolve(returnObj);
            }
        });
    });
}

module.exports = {getDraftType, getPickingOptions}