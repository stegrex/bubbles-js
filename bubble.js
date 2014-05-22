// Global Variables

var canvas; // The canvas object.
var t; // Global timer (uses 1 ms increments).

// Main methods

function main () // Initializes the game.
{
	canvas = new Canvas();
	canvas.create();
	t = setTimeout("redraw();", 1);
}
function redraw () // Redraws the canvas.
{
	canvas.redraw();
	t = setTimeout("redraw();", 1);
}

function Canvas () // Canvas class.
{
	this.timer;
	this.ctx;
}
Canvas.prototype.create = function () // Create method for the canvas (constructor).
{
	var canvas = document.getElementById("canvas");
	this.ctx = canvas.getContext("2d");
	canvas.addEventListener("mousedown", createBubble, false);
}
Canvas.prototype.redraw = function () // Canvas class's redraw method.
{
	this.ctx.clearRect(0, 0, 300, 400);
	if (bubble)
	{
		bubble.redraw();
	}
}

// Game component models.

var bubble; // One instance of a bubble.

function createBubble (event) // Bubble creation by clicking on canvas.
{
	bubble = new Bubble();
	bubble.x = event.pageX;
	bubble.y = event.pageY;
	bubble.redraw(bubble);
}

function Bubble () // Bubble class.
{
	this.x;
	this.y;
}
Bubble.prototype.redraw = function () // Bubble class's redraw method.
{
	canvas.ctx.beginPath();
	canvas.ctx.arc(this.x, this.y, 5, 0, 2*Math.PI);
	canvas.ctx.stroke();
	this.y = parseInt(this.y-1);
}