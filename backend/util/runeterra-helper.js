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
                resolve(state); //basically a return value
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
                
                //super sub-optimal sorting, but it's only 9 cards who cares
                for (var card of rectangles) {
                    xPosArray.push(card.TopLeftX);
                    yPosArray.push(card.TopLeftY);
                }
                xPosArray.sort((a,b) => a-b);
                yPosArray.sort((a,b) => a-b);
        
                if(rectangles === undefined || rectangles.length == 0) {
                	console.log('rectangles is undefined');
                    resolve(returnObj);
                } else {
                    xPosArray = [];
                    yPosArray = [];
                    minXPos = rectangles.reduce((minX, rectangle) =>
                        rectangle.TopLeftX < minX ? rectangle.TopLeftX : minX,
                        rectangles[0].TopLeftX);
                    
                    //super sub-optimal sorting, but it's only a few cards who cares
                    for (var card of rectangles) {
                    	if((rectangles.length > 9 && card.TopLeftX != minXPos) ||
                    	        rectangles.length == 9) {
                            xPosArray.push(card.TopLeftX);
                            yPosArray.push(card.TopLeftY);
                        }
                    }
                    
                    xPosArray.sort((a,b) => a-b);
                    yPosArray.sort((a,b) => b-a);
                    
                    for (var card of rectangles) {
                        if(card.TopLeftX == xPosArray[0]) {
                            if(card.TopLeftY == yPosArray[0]) {
                            	returnObj.left.top = card.CardCode;
                            } else if(card.TopLeftY == yPosArray[3]) {
                            	returnObj.left.middle = card.CardCode;
                            } else if(card.TopLeftY == yPosArray[6]) {
                            	returnObj.left.bottom = card.CardCode;
                            } 
                        } else if(card.TopLeftX == xPosArray[( xPosArray.length / 3 )]) {
                            if(card.TopLeftY == yPosArray[0]) {
                            	returnObj.middle.top = card.CardCode;
                            } else if(card.TopLeftY == yPosArray[3]) {
                            	returnObj.middle.middle = card.CardCode;
                            } else if(card.TopLeftY == yPosArray[6]) {
                            	returnObj.middle.bottom = card.CardCode;
                            } 
                        } else if(card.TopLeftX == xPosArray[(2 * xPosArray.length / 3)]) {
                            if(card.TopLeftY == yPosArray[0]) {
                            	returnObj.right.top = card.CardCode;
                            } else if(card.TopLeftY == yPosArray[3]) {
                            	returnObj.right.middle = card.CardCode;
                            } else if(card.TopLeftY == yPosArray[6]) {
                            	returnObj.right.bottom = card.CardCode;
                            } 
                        }
                    }
                    
                    resolve(returnObj);
                }
            } else {
                console.log('error getting rectangles');
                resolve(returnObj);
            }
        });
    });
}

//Return the cards when doing a swap
function getSwappingOptions(apiUrl) {
	return new Promise(resolve => {
	    request(apiUrl + '/positional-rectangles', function (error, response, body) {
            if(!error) {
                returnObj = {
                    top: {
                        left: "",
                        right: ""
                    },
                    middle: {
                        left: "",
                        right: ""
                    },
                    bottom: {
                        left: "",
                        right: ""
                    }
                };
                rectangles = JSON.parse(body).Rectangles;
                if(rectangles === undefined || rectangles.length == 0) {
                    console.log('rectangles is undefined');
                    resolve(returnObj);
                } else {
                    xPosArray = [];
                    yPosArray = [];
                    minXPos = rectangles.reduce((minX, rectangle) =>
                        rectangle.TopLeftX < minX ? rectangle.TopLeftX : minX,
                        rectangles[0].TopLeftX);
                    
                    //super sub-optimal sorting, but it's only a few cards who cares
                    for (var card of rectangles) {
                    	if(card.TopLeftX != minXPos) {
                            xPosArray.push(card.TopLeftX);
                            yPosArray.push(card.TopLeftY);
                        }
                    }
                    
                    xPosArray.sort((a,b) => a-b);
                    yPosArray.sort((a,b) => b-a);
                    
                    for (var card of rectangles) {
                        if(card.TopLeftX == xPosArray[0]) {
                            if(card.TopLeftY == yPosArray[0]) {
                            	returnObj.bottom.left = card.CardCode;
                            } else if(card.TopLeftY == yPosArray[2]) {
                            	returnObj.middle.left = card.CardCode;
                            } else if(card.TopLeftY == yPosArray[4]) {
                            	returnObj.top.left = card.CardCode;
                            } 
                        } else if(card.TopLeftX == xPosArray[3]) {
                            if(card.TopLeftY == yPosArray[0]) {
                            	returnObj.bottom.right = card.CardCode;
                            } else if(card.TopLeftY == yPosArray[2]) {
                            	returnObj.middle.right = card.CardCode;
                            } else if(card.TopLeftY == yPosArray[4]) {
                            	returnObj.top.right = card.CardCode;
                            } 
                        }
                    }
                    
                    resolve(returnObj);
                }
            } else {
                console.log('error getting rectangles');
                resolve(returnObj);
            }
        });
    });
}

function hasSameCards(set1, set2) {
    var set1Properties = Object.getOwnPropertyNames(set1);
    var set2Properties = Object.getOwnPropertyNames(set2);
    
    if(set1Properties.length != set2Properties.length) {
        return false;
    }
    
    if((set1Properties[0] === 'top' && set2Properties[0] === 'left') ||
        (set1Properties[0] === 'left' && set2Properties[0] === 'top')) {
        return false;
    }
    
    if(set1Properties[0] === 'left' && set2Properties[0] === 'left') { //Compare picking sets
        return (
        	set1.left.top === set2.left.top
            && set1.left.middle === set2.left.middle
            && set1.left.bottom === set2.left.bottom
            && set1.middle.top === set2.middle.top
            && set1.middle.middle === set2.middle.middle
            && set1.middle.bottom === set2.middle.bottom
            && set1.right.top === set2.right.top
            && set1.right.middle === set2.right.middle
            && set1.right.bottom === set2.right.bottom);
    }
    
    if(set1Properties[0] === 'top' && set2Properties[0] === 'top') { //Compare swapping sets
        return (
            (set1.top.left === set2.top.left || set1.top.left === set2.top.right)
            && (set1.top.right === set2.top.right || set1.top.right === set2.top.left)
            && (set1.middle.left === set2.middle.left || set1.middle.left === set2.middle.right)
            && (set1.middle.right === set2.middle.right || set1.middle.right === set2.middle.left)
            && (set1.bottom.left === set2.bottom.left || set1.bottom.left === set2.bottom.right)
            && (set1.bottom.right === set2.bottom.right || set1.bottom.right === set2.bottom.left));
    }
}

module.exports = {getDraftType, getPickingOptions, getSwappingOptions, hasSameCards}