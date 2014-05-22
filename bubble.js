// Global Settings

var gameMode = 1;
var maxBubbles = 25; // Maximum number of bubbles allowed in the game.
var bubbleFrequency = 100; // Milliseconds in between firings.

// Global Variables

var canvas; // The canvas object. Handles rendering.
var game; // The game object. Handles game state.
var input; // The game's event object. Handles user input actions.
var t; // Global timer (uses 1 ms increments). Handles rendering and state.

var debugOut;

// Main methods

function main () // Initializes the game.
{
	
	debugOut = document.getElementById("test");
	
	// Initialize global variables.
	game = new Game();
	game.create();
	canvas = new Canvas();
	canvas.create();
	input = new Input();
	input.create();
	t = setTimeout(function(){redraw();}, 1); // Start the game's timer loop.
}
function redraw () // Redraws the canvas.
{
	canvas.redraw(); // Render the game graphics.
	t = setTimeout(function(){redraw();}, 1); // Loops again.
}

// Main game component states

function Game ()
{
	this.bubbles;
}
Game.prototype.create = function () // Load different components for the level.
{
	this.bubbles = new Array();
}
Game.prototype.destroy = function () // Destroy the game, restarting.
{
	alert("Game restarted, too many damn bubbles.");
	this.create();
}

// Main rendering

function Canvas () // Canvas class.
{
	this.ctx;
}
Canvas.prototype.create = function () // Create method for the canvas (constructor).
{
	var canvas = document.getElementById("canvas");
	this.ctx = canvas.getContext("2d");
	this.redraw();
}
Canvas.prototype.redraw = function () // Canvas class's redraw method.
{
	this.ctx.clearRect(0, 0, 300, 400);
	// Redraw static game components.
	// Redraw level-based game components.
	for (var x in game.bubbles) // Redraw all user generated bubbles.
	{
		if (game.bubbles[x])
		{
			game.bubbles[x].redraw();
		}
	}
}

// Main user input event handling

function Input ()
{
	//this.time;
	this.held;
	this.x;
	this.y;
}
Input.prototype.create = function ()
{
	//this.time = 0;
	this.held = false;
	document.getElementById("canvas").addEventListener("mousedown", function(event){input.down(event);}, false); // Initialize the event handling for user input.
	document.getElementById("canvas").addEventListener("mousemove", function(event){input.move(event);}, false); // Initialize the event handling for user input.
	document.getElementById("canvas").addEventListener("mouseup", function(event){input.up(event);}, false); // Initialize the event handling for user input.
}
Input.prototype.down = function (event)
{
	this.held = true;
	this.x = event.pageX;
	this.y = event.pageY;
	createBubble(this.x, this.y);
	var t0 = setTimeout(function(){input.hold();}, 500);
}
Input.prototype.move = function (event)
{
	if (this.held === true)
	{
		this.x = event.pageX;
		this.y = event.pageY;
	}
}
Input.prototype.up = function ()
{
	this.held = false;
}
Input.prototype.hold = function ()
{
	if (this.held === true)
	{
		createBubble(this.x, this.y);
		var t0 = setTimeout(function(){input.hold();}, bubbleFrequency);
	}
}

// Game component models.

function createBubble (x, y) // Bubble creation by clicking on canvas.
{
	var bubble = new Bubble();
	if ((game.bubbles.length <= maxBubbles) || (gameMode === 1))
	{
		bubble.create(x, y);
		bubble.index = game.bubbles.length;
		bubble.redraw();
		game.bubbles[bubble.index] = bubble;
		
		debugOut.innerHTML = bubble.index; // Debug
		
	}
	else if (game.bubbles.length >= maxBubbles && gameMode === 0)
	{
		game.destroy();
	}
	
}

//Bubble Class

function Bubble ()
{
	this.index;
	this.x;
	this.y;
}
Bubble.prototype.create = function (x, y)
{
	this.x = x;
	this.y = y;
}
Bubble.prototype.redraw = function () // Bubble class's redraw method.
{
	canvas.ctx.beginPath();
	canvas.ctx.strokeStyle = "Blue";
	canvas.ctx.arc(this.x, this.y, 5, 0, 2*Math.PI);
	canvas.ctx.stroke();
	this.y = parseInt(this.y-1.5);
	if (this.y <= 50)
	{
		this.destruct();
	}
}
Bubble.prototype.destruct = function ()
{
	game.bubbles[this.index] = null;
}