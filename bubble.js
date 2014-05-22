// Global Settings

var gameMode = 1;
var autoShoot = 0; // Shoots a bunch of bubbles randomly if set to 1. Default 0.
var bubbleWeight = 1; // Bubble size. Default 1.
var bubbleSpeed = 1.5; // Pixel per ms bubbles float upwards. Default 1.5.
var bubbleRadius = 5; // Bubble radius. Default 5.
// var maxBubbles = 25; // Maximum number of bubbles allowed in the game.
var maxBubbleWeight = 15; // Maximum weight of the bubble before it asplodes. Default 15.
var bubbleFrequency = 150; // Milliseconds in between firings. Default 150.
var combineBubbleMode = 0;
var canvasX = 320;
var canvasY = 480;
var msPerRender = 4; // Milliseconds per animation rendering.

// Global Variables

var game; // The game object. Handles game state.
var canvas; // The canvas object. Handles rendering.
var input; // The game's event object. Handles user input actions.
var t; // Global timer (uses 1 ms increments). Handles rendering and state.
//var calcCount; // Global timer.

var song; // Object for the song.

var debugOut;

// Main methods

function main () // Initializes the game.
{
	debugOut = document.getElementById("test"); // Debug
	// Initialize global variables.
	flushGame();
	game = new Game();
	game.create();
	canvas = new Canvas();
	canvas.create();
	input = new Input();
	input.create();
	t = setTimeout(redraw, 1); // Start the game's timer loop.
}
function redraw () // Redraws the canvas.
{
	canvas.redraw(); // Render the game graphics.
	t = setTimeout(redraw, 1); // Loops again.
}
function flushGame ()
{
	var game = null;
	var canvas = null;
	var input = null;
	var t = null;
	var song = null;
	var debugOut = null;
}

function musicToggle ()
{
	var musicToggle = document.getElementById("musicToggle");
	if (parseInt(musicToggle.getAttribute("playing")) === 0)
	{
		song.play();
		musicToggle.setAttribute("playing", 1);
		musicToggle.innerHTML = "<p>Music<br />On</p>";
	}
	else if (parseInt(musicToggle.getAttribute("playing")) === 1)
	{
		song.pause();
		song.currentTime = 0;
		musicToggle.setAttribute("playing", 0);
		musicToggle.innerHTML = "<p>Music<br />Off</p>";
	}
}

// Main game component states

function Game ()
{
	this.blocks;
	this.bubbles;
}
Game.prototype.create = function () // Load different components for the level.
{
	this.blocks = new Array();
	this.bubbles = new Array();
	this.asplodeBubbles = new Array();
	
	this.load();
	
}
Game.prototype.load = function () // Load the components of a level from a file.
{
	if (navigator.appname != "Microsoft Internet Explorer")
	{
		song = new Audio("6-1-12.ogg");
		song.loop = true;
		document.getElementById("musicToggle").addEventListener("click", musicToggle, false);
	}
	this.blocks[0] = new Block();
	this.blocks[0].create(200, 200, 100, 10);
	this.blocks[1] = new Block();
	this.blocks[1].create(50, 100, 50, 10);
}
Game.prototype.destruct = function () // Destruct the game, restarting.
{
	alert("Game restarted, too many damn bubbles.");
	clearTimeout(t);
	this.create();
}

// Main rendering

function Canvas () // Canvas class.
{
	this.ctx;
	this.calcCount;
}
Canvas.prototype.create = function () // Create method for the canvas (constructor).
{
	var canvas = document.getElementById("canvas");
	this.ctx = canvas.getContext("2d");
	this.calcCount = 0;
	this.redraw();
}
Canvas.prototype.redraw = function () // Canvas class's redraw method.
{
	for (var x in game.bubbles) // Calculate all bubble states.
	{
		if (game.bubbles[x])
		{
			game.bubbles[x].calculate();
		}
	}
	this.calcCount++;
	if (this.calcCount === msPerRender) // Render every x millisecond to reduce amount of renders, increase speed.
	{
		this.ctx.clearRect(0, 0, canvasX, canvasY); // Clear the canvas.
		for (var x in game.blocks) // Redraw all static blocks.
		{
			if (game.blocks[x])
			{
				game.blocks[x].redraw();
			}
		}
		// Redraw level-based game components.
		for (var x in game.bubbles) // Redraw all user generated bubbles.
		{
			if (game.bubbles[x])
			{
				game.bubbles[x].redraw();
			}
		}
		for (var x in game.asplodeBubbles)// Redraw the next frame of the destroyed bubble's animation.
		{
			if (game.asplodeBubbles[x])
			{
				game.asplodeBubbles[x].asplode();
			}
		}
		this.calcCount = 0; // Reset counter.
	}
}

// Main user input event handling

function Input ()
{
	this.t;
	this.held;
	this.x;
	this.y;
}
Input.prototype.create = function () // Add event listeners to the canvas.
{
	this.held = false;
	document.getElementById("canvas").addEventListener("mousedown", function(event){input.down(event);}, false); // Initialize the event handling for user input.
	document.getElementById("canvas").addEventListener("mousemove", function(event){input.move(event);}, false); // Initialize the event handling for user input.
	document.getElementById("canvas").addEventListener("mouseup", function(event){input.up(event);}, false); // Initialize the event handling for user input.
}
Input.prototype.down = function (event) // Fire when mouse goes down.
{
	this.held = true;
	this.x = event.pageX;
	this.y = event.pageY;
	createBubble(this.x, this.y);
	this.t = setTimeout(function(){input.hold();}, 500);
}
Input.prototype.move = function (event) // Fire when moving around with mouse down.
{
	if (this.held === true)
	{
		this.x = event.pageX;
		this.y = event.pageY;
	}
}
Input.prototype.up = function () // Fire when mouse goes up.
{
	this.held = false;
	clearTimeout(this.t)
}
Input.prototype.hold = function () // Recursively firing for a stream of bubbles.
{
	if (this.held === true)
	{
		createBubble(this.x, this.y);
		this.t = setTimeout(function(){input.hold();}, bubbleFrequency);
	}
}

// Game component models.

function createBubble (x, y) // Bubble creation by clicking on canvas.
{
	if (autoShoot === 1)
	{
		var ax = setTimeout(createBubble, bubbleFrequency/2, 41+Math.random()*(canvasX-41), Math.random()*canvasY);
	}
	var bubble = new Bubble();
	bubble.create(x, y);
	if (y >= 41)
	{
		bubble.index = game.bubbles.length;
		game.bubbles[bubble.index] = bubble;
	}
	debugOut.innerHTML = bubble.index; // Debug
}

// Bubble Class

function Bubble ()
{
	this.type;
	this.index;
	this.isBlocked;
	this.x;
	this.y;
	this.r;
	this.weight;
	this.moving;
	this.asploding;
}
Bubble.prototype.create = function (x, y) // Create bubble.
{
	this.type = "Bubble";
	this.x = x;
	this.y = y;
	this.r;
	this.weight = ((bubbleWeight <= maxBubbleWeight-1 || maxBubbleWeight === 0) ? bubbleWeight : maxBubbleWeight-1);
	this.moving = true;
	this.asploding = false;
}
Bubble.prototype.calculate = function () // Bubble class's calculation method for next position.
{
	for (var x in game.bubbles) // Calculate any bubble combines that are required.
	{
		if (game.bubbles[x] && x != this.index)
		{
			this.combine(game.bubbles[x]);
		}
	}
	this.r = Math.sqrt(Math.pow(bubbleRadius, 2)*this.weight); // Calculate the current radius.
	var returnVal = false;
	var params = {"x":this.x, "y":this.y, "r":this.r}
	for (var x in game.blocks) // Calculate position based on any blocks.
	{
		if (game.blocks[x].position(this.type, params))
		{
			this.x = game.blocks[x].position(this.type, params)[0];
			this.y = game.blocks[x].position(this.type, params)[1];
			this.moving = false;
			returnVal = true;
		}
	}
	// Calculate position based on other game elements.
	if (returnVal === false) // Set the new position if no other calculations have set any positions.
	{
		this.y = this.y-bubbleSpeed;
		this.moving = true;
	}
	if (this.y <= (10+Math.random()*30) || (maxBubbleWeight >= 1 && this.weight >= maxBubbleWeight)) // Asplode the bubble if it's too big, or is leaving the play area.
	{
		this.asplodePrepare();
	}
}
Bubble.prototype.combine = function (bubbleObject) // Bubble class's combine method for testing the case of two bubbles touching.
{
	if ((this.weight <= bubbleObject.weight) && (Math.sqrt(Math.pow(this.x-bubbleObject.x, 2)+Math.pow(this.y-bubbleObject.y, 2)) <= this.r+bubbleObject.r))
	{
		var bubbleObjectWeight = bubbleObject.weight;
		bubbleObject.weight += this.weight;
		bubbleObject.y += Math.sqrt(Math.pow(bubbleRadius, 2)*this.weight);
		bubbleObject.x = (combineBubbleMode === 0 ? (this.x*this.weight+bubbleObject.x*bubbleObjectWeight)/(this.weight+bubbleObjectWeight) : this.x);
		this.destruct();
		bubbleObject.redraw();
	}
}
Bubble.prototype.redraw = function () // Bubble class's redraw method. Rendering only.
{
	canvas.ctx.beginPath();
	canvas.ctx.strokeStyle = "LightSeaGreen";
	canvas.ctx.arc((this.moving ? this.x+Math.sqrt(this.r)/2-Math.random()*Math.sqrt(this.r) : this.x), this.y, this.r, 0, 2*Math.PI);
	canvas.ctx.stroke();
	canvas.ctx.fillStyle = "LightSeaGreen";
	canvas.ctx.font = "10px Tahoma, Geneva, sans-serif";
	canvas.ctx.textAlign = "center";
	canvas.ctx.textBaseline = "middle";
	canvas.ctx.fillText(Math.floor(this.weight), this.x, this.y);
}
Bubble.prototype.asplodePrepare = function () // Prepare the bubble to be asploded.
{
	this.d = 0;
	this.r *= 2;
	this.rStart = this.r;
	this.y += this.r/4;
	var index = game.asplodeBubbles.length;
	this.destruct();
	this.index = index;
	this.asploding = true;
	game.asplodeBubbles[index] = this;
}
Bubble.prototype.asplode = function () // Render the next frame of the asplosion.
{
	if (this.r >= this.rStart/15)
	{
		this.d += 0.1;
		this.r -= this.rStart/30;
		this.y -= this.rStart/30;
		canvas.ctx.beginPath();
		canvas.ctx.strokeStyle = "LightSkyBlue";
		canvas.ctx.arc(this.x+Math.sqrt(this.r)-2*Math.random()*Math.sqrt(this.r), this.y, this.r, 1.5*Math.PI-this.d-Math.random()*1, 1.5*Math.PI+this.d+Math.random()*1, true);
		canvas.ctx.stroke();
		canvas.ctx.beginPath();
		canvas.ctx.strokeStyle = "PowderBlue";
		canvas.ctx.arc(this.x, this.y, (this.r-3 >= 0 ? this.r-3 : 0), 1.5*Math.PI-this.d, 1.5*Math.PI+this.d, true);
		canvas.ctx.stroke();
		canvas.ctx.beginPath();
		canvas.ctx.strokeStyle = "White";
		canvas.ctx.arc(this.x, this.y, this.r, 1.5*Math.PI+this.d, 1.5*Math.PI-this.d, true);
		canvas.ctx.stroke();
	}
	else // Destruct the bubble once it is too small.
	{
		this.destruct();
	}
}
Bubble.prototype.destruct = function () // Bubble class's destruct method.
{
	if (game.bubbles[this.index] && this.asploding === false)
	{
		game.bubbles[this.index] = null;
	}
	if (game.asplodeBubbles[this.index] && this.asploding === true)
	{
		game.asplodeBubbles[this.index] = null;
	}
}

// Block Class

function Block ()
{
	this.type;
	this.index;
	this.x;
	this.y;
	this.w;
	this.h;
}
Block.prototype.create = function (x, y, w, h) // Create block.
{
	this.type = "Block";
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}
Block.prototype.redraw = function () // Block class's redraw method.
{
	canvas.ctx.beginPath();
	canvas.ctx.strokeStyle = "Black";
	canvas.ctx.strokeRect(this.x, this.y, this.w, this.h);
	canvas.ctx.stroke();
}
Block.prototype.position = function (type, params) // Interface for Bubble's calculate method to find next position.
{
	if (type === "Bubble")
	{
		var x = params["x"];
		var y = params["y"];
		var r = params["r"];
		if ((x >= this.x && x <= this.x+this.w) && (y >= this.y+this.h+r && y <= this.y+this.h+r+2))
		{
			return [x, y];
		}
		else
		{
			return false;
		}
	}
	else
	{
		return false;
	}
}

// FloatBlock Class

function FloatBlock ()
{
	this.type;
	this.index;
	this.x;
	this.y;
	this.w;
	this.h;
	this.weight;
}
FloatBlock.prototype.create = function (x, y, w, h) // Create block.
{
	this.type = "FloatBlock";
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
}
FloatBlock.prototype.redraw = function () // Block class's redraw method.
{
	canvas.ctx.beginPath();
	canvas.ctx.strokeStyle = "Black";
	canvas.ctx.strokeRect(this.x, this.y, this.w, this.h);
	canvas.ctx.stroke();
}
FloatBlock.prototype.position = function (x, y, r) // Interface for Bubble's calculate method to find next position.
{
	if ((x >= this.x && x <= this.x+this.w) && (y >= this.y+this.h+r && y <= this.y+this.h+r+2))
	{
		return [x, y];
	}
	else
	{
		return false;
	}
}