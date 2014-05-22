// Global Settings

var gameMode = 1;
var bubbleRadius = 5; // Bubble radius. Default 5.
var maxBubbles = 25; // Maximum number of bubbles allowed in the game.
var maxBubbleWeight = 15; // Maximum weight of the bubble before it asplodes.
var bubbleFrequency = 150; // Milliseconds in between firings. Default 250.
var canvasX = 320;
var canvasY = 480;
var msPerRender = 4; // Milliseconds per animation rendering.

// Global Variables

var game; // The game object. Handles game state.
var canvas; // The canvas object. Handles rendering.
var input; // The game's event object. Handles user input actions.
var t; // Global timer (uses 1 ms increments). Handles rendering and state.
var calcCount; // Global timer.

var song; // Object for the song.

var debugOut;

// Main methods

function main () // Initializes the game.
{
	debugOut = document.getElementById("test"); // Debug
	// Initialize global variables.
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
	this.asplodeBubble = null;
	
	this.load();
	
}
Game.prototype.load = function () // Load the components of a level from a file.
{
	song = new Audio("6-1-12.ogg");
	song.loop = true;
	document.getElementById("musicToggle").addEventListener("click", musicToggle, false);
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
	for (var x in game.bubbles)
	{
		if (game.bubbles[x])
		{
			game.bubbles[x].calculate();
		}
	}
	this.calcCount++;
	if (this.calcCount === msPerRender)
	{
		this.ctx.clearRect(0, 0, canvasX, canvasY);
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
		if (game.asplodeBubble)
		{
			game.asplodeBubble.asplode();
		}
		this.calcCount = 0;
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
	var bubble = new Bubble();
	bubble.create(x, y);
	bubble.index = game.bubbles.length;
	bubble.redraw();
	game.bubbles[bubble.index] = bubble;
	debugOut.innerHTML = bubble.index; // Debug
}

// Bubble Class

function Bubble ()
{
	this.index;
	this.isBlocked;
	this.x;
	this.y;
	this.r;
	this.weight;
	this.moving;
}
Bubble.prototype.create = function (x, y) // Create bubble.
{
	this.x = x;
	this.y = y;
	this.r;
	this.weight = 1;
	this.moving = true;
	this.calculate();
}
Bubble.prototype.calculate = function () // Bubble class's calculation method for next position.
{
	for (var x in game.bubbles)
	{
		if (game.bubbles[x] && x != this.index)
		{
			this.combine(game.bubbles[x]);
		}
	}
	this.r = Math.sqrt(Math.pow(bubbleRadius, 2)*this.weight);
	var returnVal = false;
	for (var x in game.blocks)
	{
		if (game.blocks[x].position(this.x, this.y, this.r))
		{
			this.x = game.blocks[x].position(this.x, this.y, this.r)[0];
			this.y = game.blocks[x].position(this.x, this.y, this.r)[1];
			this.moving = false;
			returnVal = true;
		}
	}
	if (returnVal === false)
	{
		this.y = this.y-1.5;
		this.moving = true;
	}
	if (this.y <= 50)
	{
		this.destruct();
	}
	if (this.weight >= maxBubbleWeight)
	{
		this.r *= 2;
		this.y += this.r/4;
		game.asplodeBubble = this;
		this.destruct();
	}
}
Bubble.prototype.combine = function (bubbleObject) // Bubble class's combine method for the case of two bubbles touching.
{
	if ((this.weight <= bubbleObject.weight) && (Math.sqrt(Math.pow(this.x-bubbleObject.x, 2)+Math.pow(this.y-bubbleObject.y, 2)) <= this.r+bubbleObject.r))
	{
		var bubbleObjectWeight = bubbleObject.weight;
		bubbleObject.weight += this.weight;
		bubbleObject.y += Math.sqrt(Math.pow(bubbleRadius, 2)*this.weight);
		bubbleObject.x = (this.x*this.weight+bubbleObject.x*bubbleObjectWeight)/(this.weight+bubbleObjectWeight);
		this.destruct();
		bubbleObject.redraw();
	}
}
Bubble.prototype.redraw = function () // Bubble class's redraw method.
{
	canvas.ctx.beginPath();
	canvas.ctx.strokeStyle = "LightSeaGreen";
	canvas.ctx.arc((this.moving ? this.x+Math.sqrt(this.r)/2-Math.random()*Math.sqrt(this.r) : this.x), this.y, this.r, 0, 2*Math.PI);
	canvas.ctx.stroke();
	canvas.ctx.fillStyle = "LightSeaGreen";
	canvas.ctx.font = "10px Tahoma, Geneva, sans-serif";
	canvas.ctx.textAlign = "center";
	canvas.ctx.textBaseline = "middle";
	canvas.ctx.fillText(this.weight, this.x, this.y);
}
Bubble.prototype.asplode = function ()
{
	if (this.r >= 3)
	{
		this.r -= 1.5;
		this.y -= 1.5;
		canvas.ctx.beginPath();
		canvas.ctx.strokeStyle = "LightSkyBlue";
		canvas.ctx.arc(this.x+Math.sqrt(this.r)-2*Math.random()*Math.sqrt(this.r), this.y, this.r, 0, 2*Math.PI);
		canvas.ctx.stroke();
	}
	else if (this.r < 2)
	{
		game.asplodeBubble = null;
	}
}
Bubble.prototype.destruct = function () // Bubble class's destruct method.
{
	game.bubbles[this.index] = null;
}

// Block Class

function Block ()
{
	this.index;
	this.x;
	this.y;
	this.w;
	this.h;
}
Block.prototype.create = function (x, y, w, h) // Create block.
{
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
Block.prototype.position = function (x, y, r) // Interface for Bubble's calculate method to find next position.
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

// FloatBlock Class

function FloatBlock ()
{
	this.index;
	this.x;
	this.y;
	this.w;
	this.h;
	this.weight;
}
FloatBlock.prototype.create = function (x, y, w, h) // Create block.
{
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