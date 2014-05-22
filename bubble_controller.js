function initController ()
{
	//document.getElementById("gameMode").value = gameMode;
	document.getElementById("autoShoot").value = autoShoot;
	document.getElementById("bubbleWeight").value = bubbleWeight;
	document.getElementById("bubbleSpeed").value = bubbleSpeed;
	document.getElementById("bubbleRadius").value = bubbleRadius;
	document.getElementById("maxBubbleWeight").value = maxBubbleWeight;
	document.getElementById("bubbleFrequency").value = bubbleFrequency;
	document.getElementById("combineBubbleMode").value = combineBubbleMode;
	//document.getElementById("msPerRender").value = msPerRender;
}
function select (object)
{
	object.select();
}
function changeParam (object)
{
	var evalString = object.id+" = parseFloat(object.value)";
	eval(evalString);
	document.getElementById("testDisplay").innerHTML = object.value;
}