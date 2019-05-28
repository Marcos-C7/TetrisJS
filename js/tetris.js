
class	Textures
{
	constructor()
	{
		this.namesColors = ["blue", "green", "grey", "orange", "pearl", "purple", "red", "yellow"];
		this.namesMasks = ["gradient_black", "gradient_white", "dark"];
		this.namesMaterials = ["bricks", "fire_block", "end_img", "heart", "background", "dark_fire_block", "background_heart"];
		this.maps = {};
		this.loader = new THREE.TextureLoader();
	}
	
	loadTextures()
	{
		var promises = [];
		for (let i = 0; i < this.namesColors.length; ++i)
			promises.push(new Promise(resolve => {this.maps[this.namesColors[i]] = this.loader.load("/imgs/" + this.namesColors[i] + ".jpg", resolve);}));
		for (let i = 0; i < this.namesMasks.length; ++i)
			promises.push(new Promise(resolve => {this.maps[this.namesMasks[i]] = this.loader.load("/imgs/" + this.namesMasks[i] + ".jpg", resolve);}));
		for (let i = 0; i < this.namesMaterials.length; ++i)
			promises.push(new Promise(resolve => {this.maps[this.namesMaterials[i]] = this.loader.load("/imgs/" + this.namesMaterials[i] + ".jpg", resolve);}));
		return promises;
	}
}


class	Shapes
{
	constructor()
	{
		this.names = ["O", "I", "S", "Z", "L", "J", "T"];
		this.shapes = {};
		this.pivots = {};
	}
	
	make()
	{
		this.shapes["O"] = [[0,0], [1,0], [1,1], [0,1]];
		this.shapes["I"] = [[0,0], [0,1], [0,2], [0,3]];
		this.shapes["S"] = [[0,0], [1,0], [1,1], [2,1]];
		this.shapes["Z"] = [[0,1], [1,1], [1,0], [2,0]];
		this.shapes["L"] = [[0,2], [0,1], [0,0], [1,0]];
		this.shapes["J"] = [[0,0], [1,0], [1,1], [1,2]];
		this.shapes["T"] = [[0,1], [1,1], [2,1], [1,0]];
		
		this.pivots["O"] = null;
		this.pivots["I"] = [0,2];
		this.pivots["S"] = [1,1];
		this.pivots["Z"] = [1,1];
		this.pivots["L"] = [0,1];
		this.pivots["J"] = [1,1];
		this.pivots["T"] = [1,1];
	}
}


class	Audios
{
	constructor()
	{
		this.names = ["tetris.ogg", "blink.ogg"];
		this.tracks = {};
		this.listener = new THREE.AudioListener();
		this.loader = new THREE.AudioLoader();
	}
	
	loadAudios()
	{
		var promises = [];
		for (let i = 0; i < this.names.length; ++i)
			promises.push(new Promise(resolve => {this.loader.load("/audio/" + this.names[i], resolve);}));
		return promises;
	}
}


class	Box
{
	// Parameters types: (float, float, float, float), 
	constructor(left, bottom, right, top)
	{
		this.left = left;
		this.bottom = bottom;
		this.right = right;
		this.top = top;
	}
	
	fix()
	{
		var aux = 0;
		if (this.left > this.right) {aux = this.left; this.left = this.right; this.right = aux;}
		if (this.bottom > this.top) {aux = this.bottom; this.bottom = this.top; this.top = aux;}
	}
	
	shrink()
	{
		this.left += 1;
		this.bottom += 1;
		this.right -= 1;
		this.top -= 1;
	}
	
	move(displacement)
	{
		this.left += displacement.x;
		this.bottom += displacement.y;
		this.right += displacement.x;
		this.top += displacement.y;
	}
	
	set(left, bottom, right, top)
	{
		this.left = left;
		this.bottom = bottom;
		this.right = right;
		this.top = top;
	}
	
	setFromBox(box)
	{
		this.left = box.left;
		this.bottom = box.bottom;
		this.right = box.right;
		this.top = box.top;
	}
	
	copy()
	{
		return new Box(this.left, this.bottom, this.right, this.top);
	}
	
	// Returns true if the given point is inside or in the border of the box.
	// Parameters types: (THREE.Vector2)
	// Return type: bool
	covers(point)
	{
		return (point.x >= this.left) && (point.x <= this.right) && (point.y >= this.bottom) && (point.y <= this.top);
	}
	
	// Returns true if the given point is estrictly inside of the box.
	// Parameters types: (THREE.Vector2)
	// Return type: bool
	contains(point)
	{
		return (point.x > this.left) && (point.x < this.right) && (point.y > this.bottom) && (point.y < this.top);
	}
}


class	Block
{
	constructor(render, position=new THREE.Vector2(0,0), color="blue", form="square", visible=true)
	{
		this.render = render;
		this.position = position;
		this.color = color;
		this.form = form;
		this.visible = visible;
		
		this.block = null;
		this.make(visible);
	}
	
	make(visible=null)
	{
		if (this.block != null) return;
		
		var material = null;
		var geometry = null;
		
		if (visible != null) this.visible = visible;
		
		if (typeof(this.color) == "string")
			material = new THREE.MeshBasicMaterial({map:this.render.textures.maps[this.color]});
		else if (typeof(this.color) == "number")
			material = new THREE.MeshMatcapMaterial({color:this.color});
		
		if (this.form == "square")
			geometry = new THREE.PlaneGeometry(1, 1);
		else if (this.form == "cube")
			geometry = new THREE.BoxGeometry(1, 1, 1);
		else if (this.form == "circle")
			geometry = new THREE.CircleGeometry(0.5, 20);
		else if (this.form == "sphere")
			geometry = new THREE.SphereGeometry(0.5, 20, 20);
		
		this.block = new THREE.Mesh(geometry, material);
		
		this.block.position.set(this.position.x + 0.5, this.position.y + 0.5, 0);		
		this.block.visible = this.visible;
		
		this.render.scene.add(this.block);
	}
	
	setVisibility(visible)
	{
		this.visible = visible;
		this.block.visible = this.visible;
	}
	
	setPosition(position)
	{
		this.position = position;
		this.block.position.set(position.x + 0.5, position.y + 0.5, 0);
	}
	
	move(displacement)
	{
		this.position.add(displacement);
		this.setPosition(this.position);
	}
	
	remove()
	{
		if (this.block == null) return;
		this.setVisibility(false);
		this.render.scene.remove(this.block);
	}
}


class	Piece
{
	constructor(render, origin, shapeName, pivot, visibleBox, color="blue", form="square", visible=true)
	{
		this.render = render;
		this.origin = origin;
		this.shapeName = shapeName;
		// If the pivot is null, then the piece will not rotate.
		this.pivot = pivot;
		this.visibleBox = visibleBox;
		this.color = color;
		this.form = form;
		this.visible = visible;
		// The array of Blocks that form the piece.
		this.blocks = null;
		
		// Make the piece.
		this.make();
	}
	
	// Makes the piece, if there was one already created, it will remain in scene unless removed with 'this.remove()'.
	make()
	{
		// If no pivot defined, then take the default converted to 'THREE.Vector2' if not null.
		if (this.pivot === undefined)
		{
			if (this.render.shapes.pivots[this.shapeName] == null)
				this.pivot = null;
			else
				this.pivot = new THREE.Vector2().fromArray(this.render.shapes.pivots[this.shapeName]);
		}
		
		// Create all the blocks of the piece.
		this.blocks = Array.from(this.render.shapes.shapes[this.shapeName], v => 
			new Block(this.render, (new THREE.Vector2(v[0], v[1])).add(this.origin), this.color, this.form, false)
		);
		
		// Set the visiblity if the piece correctly.
		this.setVisibility(this.visible);
	}
	
	// 0=Clock, 1=CounterClock
	rotate(direction=0)
	{
		// Only rotate if there is a pivot to rotate around.
		if (this.pivot == null) return;
		var x, y;
		var mx = (direction == 0 ? -1 : 1);
		var my = (direction == 0 ? 1 : -1);
		var newPosition = null;
		
		for (var i = 0; i < this.blocks.length; ++i)
		{
			newPosition = this.blocks[i].position;
			newPosition.sub(this.origin);
			x = this.blocks[i].position.x;
			y = this.blocks[i].position.y;
			newPosition.x = my * (y - this.pivot.y) + this.pivot.x;
			newPosition.y = mx * (x - this.pivot.x) + this.pivot.y;
			newPosition.add(this.origin);
			this.blocks[i].setPosition(newPosition);
		}
		
		this.setVisibility(this.visible);
	}
	
	move(displacement)
	{
		this.origin.add(displacement);
		for (var i = 0; i < this.blocks.length; ++i)
			this.blocks[i].move(displacement);
		this.setVisibility(this.visible);
	}
	
	setOrigin(origin)
	{
		this.move(origin.sub(this.origin));
	}
	
	setVisibility(visible)
	{
		var blockCovered;
		this.visible = visible;
		for (var i = 0; i < this.blocks.length; ++i)
		{
			// The block can only be visible is it is covered by the 'visibleBox'.
			blockCovered = this.visibleBox.covers(this.blocks[i].position);
			this.blocks[i].setVisibility(this.visible && blockCovered);
		}
	}
	
	remove()
	{
		if (this.blocks == null) return;
		
		this.setVisibility(false);
		for (var i = 0; i < this.blocks.length; ++i)
			this.blocks[i].remove();
	}
}


class	Board
{
	constructor(render, width, height, origin=new THREE.Vector2(0,0))
	{
		this.render = render;
		this.width = width;
		this.height = height;
		this.origin = origin;
		// The grid is where the pieces will live.
		this.grid = null;
		// The frame is all that surounds the grid.
		this.frame = null;
		// The frame-box contains the grid and the frame.
		this.frameBox = new Box(-1, -1, this.width, this.height);
		// Track the number of blocks in each line of the board.
		this.lineBlocks = new Array(this.height);
		// The lines marked.
		this.markedLines = null;
		// Frame visibility.
		this.frameVisible = null;
		// The current state of the spiral effect.
		this.spiralState = {"x":0, "y":0, "dx":1, "dy":0, "edge":"bottom", "steps":0, "frame":new Box(0,0,this.width-1, this.height-1)};
		// Background of the grid.
		this.background = null;
		
		// Initialize all the number of blocks of each line to zero.
		for (var i = 0; i < this.lineBlocks.length; ++i) this.lineBlocks[i] = 0;
		
		// Create and empty 2D array for the grid.
		this.createGridSpace();
	}
	
	// Create the grid space.
	createGridSpace()
	{
		this.grid = new Array(this.width);
		for (var i = 0; i < this.grid.length; ++i)
			this.grid[i] = new Array(this.height);
		for (var i = 0; i < this.width; ++i)
		for (var j = 0; j < this.height; ++j)
			this.grid[i][j] = null;
	}
	
	// This must be called once the textures have been loaded.
	createFrame(color, form)
	{
		var x=-1 ,y = -1;
		var dx = 1, dy = 0;
		var edge = 0;
		
		this.frameVisible = true;
		this.frame = new Array(2 * this.width + 2 * this.height + 4);
		
		for (var i = 0; i < this.frame.length; ++i)
		{
			this.frame[i] = new Block(this.render, (new THREE.Vector2(x,y)).add(this.origin), color, form, true);
			
			if (edge == 0 && x == this.frameBox.right)
			{
				dx = 0;
				dy = 1;
				edge = 1;
			}
			else if (edge == 1 && y == this.frameBox.top)
			{
				dx = -1;
				dy = 0;
				edge = 2;
			}
			else if (edge == 2 && x == this.frameBox.left)
			{
				dx = 0;
				dy = -1;
				edge = 3;
			}
			else if (edge == 3 && y == this.frameBox.bottom)
			{
				dx = 1;
				dy = 0;
				edge = 0;
			}
			x += dx;
			y += dy;
		}
	}
	
	setFrameVisibility(visible)
	{
		if (this.frame == null) return;
		for (var i = 0; i < this.frame.length; ++i)
			this.frame[i].setVisibility(visible);
		this.frameVisible = visible;
	}
	
	addBlock(block, mode)
	{
		var relativePosition = new THREE.Vector2().copy(block.position);
		
		if (mode == "absolute") relativePosition.sub(this.origin);
		
		// Only add the block if it falls inside the grid, otherwise clear it, since it may be already in the scene.
		if (!this.frameBox.contains(relativePosition))
		{
			block.remove();
			return;
		}
		
		var x = relativePosition.x;
		var y = relativePosition.y;
		
		if (this.grid[x][y] == null) this.lineBlocks[y] += 1;
		if (mode == "relative") block.move(this.origin);
		this.grid[x][y] = block;
	}
	
	addPiece(piece, mode)
	{
		if (mode == "relative")
			piece.visibleBox.set(0, 0, this.width - 1, this.height - 1);
		else 
			piece.visibleBox.set(this.origin.x, this.origin.y, this.origin.x + this.width - 1, this.origin.y + this.height - 1);
		
		piece.setVisibility(piece.visible);
		for (var i = 0; i < piece.blocks.length; ++i)
			this.addBlock(piece.blocks[i], mode);
	}
	
	clearBlock(position)
	{
		if (!this.frameBox.contains(position) || this.grid[position.x][position.y] == null) return;
		
		this.grid[position.x][position.y].remove();
		this.grid[position.x][position.y] = null;
		this.lineBlocks[position.y] -= 1;
	}
	
	fullLines()
	{
		var lines = [];
		
		for (var i = 0; i < this.lineBlocks.length; ++i)
			if (this.lineBlocks[i] == this.width) lines.push(i);
		return lines;
	}
	
	clearLine(y)
	{
		if (y < 0 || y >= this.height) return;
		
		for (var i = 0; i < this.width; ++i)
			this.clearBlock(new THREE.Vector2(i, y));
	}
	
	moveBlock(position, displacement)
	{
		if (!this.frameBox.contains(position)) return;
		
		var newPosition = (new THREE.Vector2(0,0)).copy(position).add(displacement);
		
		this.clearBlock(newPosition);
		if (this.grid[position.x][position.y] != null && this.frameBox.contains(newPosition))
		{
			var block = this.grid[position.x][position.y];
			var newBlock = new Block(this.render, newPosition, block.color, block.form, block.visible);
			this.addBlock(newBlock, "relative");
		}
		this.clearBlock(position);
	}
	
	moveLine(y, steps)
	{
		if (y < 0 || y >= this.height || y + steps < 0 || y + steps >= this.height) return;
		
		for (var i = 0; i < this.width; ++i)
			this.moveBlock(new THREE.Vector2(i, y), new THREE.Vector2(0, steps));
	}
	
	blockOnTop()
	{
		return this.lineBlocks[this.height - 1] > 0;
	}
	
	markLines(lines)
	{
		this.markedLines = new Array(lines.length);
		
		for (var j = 0; j < lines.length; ++j)
		{
			this.markedLines[j] = new Array(this.width);
			for (var i = 0; i < this.width; ++i)
				this.markedLines[j][i] = new Block(this.render, (new THREE.Vector2(i,lines[j])).add(this.origin), "fire_block", "square", true);
		}
	}
	
	blinkMarkedLines()
	{
		if (this.markedLines == null) return;
		
		for (var j = 0; j < this.markedLines.length; ++j)
		for (var i = 0; i < this.width; ++i)
			this.markedLines[j][i].setVisibility(!this.markedLines[j][i].block.visible)
	}
	
	clearMarkedLines()
	{
		if (this.markedLines == null) return;
		
		for (var j = 0; j < this.markedLines.length; ++j)
		for (var i = 0; i < this.width; ++i)
		{
			this.markedLines[j][i].remove();
			this.markedLines[j][i] = null;
		}
		this.markedLines = null;
	}
	
	nextBoardSpiral(mode)
	{
		if (this.spiralState.steps == this.width * this.height)
		{
			console.log("SPIRAL DONE, RESET STATE");
			return;
		}
		this.spiralState.steps += 1;
		
		this.clearBlock(new THREE.Vector2(this.spiralState.x, this.spiralState.y));
		if (mode == "show")
			this.addBlock(new Block(this.render, new THREE.Vector2(this.spiralState.x, this.spiralState.y), "fire_block", "square", true), "relative");
		
		if (this.spiralState.edge == "bottom" && this.spiralState.x == this.spiralState.frame.right)
		{
			this.spiralState.dx = 0;
			this.spiralState.dy = 1;
			this.spiralState.edge = "right";
		}
		else if (this.spiralState.edge == "right" && this.spiralState.y == this.spiralState.frame.top)
		{
			this.spiralState.dx = -1;
			this.spiralState.dy = 0;
			this.spiralState.edge = "top";
		}
		else if (this.spiralState.edge == "top" && this.spiralState.x == this.spiralState.frame.left)
		{
			this.spiralState.dx = 0;
			this.spiralState.dy = -1;
			this.spiralState.edge = "left";
		}
		else if (this.spiralState.edge == "left" && this.spiralState.y == this.spiralState.frame.bottom + 1)
		{
			this.spiralState.dx = 1;
			this.spiralState.dy = 0;
			this.spiralState.edge = "bottom";
			this.spiralState.frame.shrink();
		}
		this.spiralState.x += this.spiralState.dx;
		this.spiralState.y += this.spiralState.dy;
	}
	
	resetSpiralState()
	{
		this.spiralState = {"x":0, "y":0, "dx":1, "dy":0, "edge":"bottom", "steps":0, "frame":new Box(0,0,this.width-1, this.height-1)};
	}
	
	makeBackground(texture)
	{
		var material = new THREE.MeshBasicMaterial({map:this.render.textures.maps[texture]});
		var geometry = new THREE.PlaneGeometry(this.width, this.height);
		
		// Clear the background, if thre is one.
		this.clearBackground();
		
		this.background = new THREE.Mesh(geometry, material);
		this.background.position.set(this.width / 2 + this.origin.x, this.height / 2 + this.origin.y, -0.1);
		this.background.visible = true;
		
		this.render.scene.add(this.background);
	}
	
	clearBackground()
	{
		if (this.background == null) return;
		this.render.scene.remove(this.background);
		this.background = null;
	}
	
	changeFrameTexture(name)
	{
		for (var i = 0; i < this.frame.length; ++i)
			this.frame[i].block.material.map = this.render.textures.maps[name];
	}
	
	// Checks if the given block shares a border with any of the blocks of the grid.
	// If 'border=true', then also considers the border of the grid in the test.
	// Parameters types: (Block, bool)
	// Return type: {"left":bool, "bottom":bool, "right":bool, "top":bool, "over":bool}
	collisionBlock(block, border=false)
	{
		var collisions = {"left":false, "bottom":false, "right":false, "top":false, "over":false};
		
		var relativePosition = new THREE.Vector2().copy(block.position).sub(this.origin);
		
		if (this.frameBox.contains(relativePosition))
		{
			if (relativePosition.x > 0 && this.grid[relativePosition.x - 1][relativePosition.y] != null) collisions["left"] = true;
			if (relativePosition.y > 0 && this.grid[relativePosition.x][relativePosition.y - 1] != null) collisions["bottom"] = true;
			if (relativePosition.x < this.width - 1 && this.grid[relativePosition.x + 1][relativePosition.y] != null) collisions["right"] = true;
			if (relativePosition.y < this.height - 1 && this.grid[relativePosition.x][relativePosition.y + 1] != null) collisions["top"] = true;
			if (this.grid[relativePosition.x][relativePosition.y] != null) collisions["over"] = true;
		}
		
		if (border)
		{
			if (relativePosition.x == 0) collisions["left"] = true;
			if (relativePosition.y == 0) collisions["bottom"] = true;
			if (relativePosition.x == this.width - 1) collisions["right"] = true;
			if (relativePosition.y == this.height - 1) collisions["top"] = true;
			if (!this.frameBox.contains(relativePosition)) collisions["over"] = true;
		}
		
		return collisions;
	}
	
	collisionPiece(piece, border=false)
	{
		var collisionsBlocks = piece.blocks.map(b => this.collisionBlock(b, border));
		var collisions = {};
		var keys = Object.keys(collisionsBlocks[0]);
		
		keys.forEach(key => {collisions[key] = collisionsBlocks.map(c => c[key]).some(x => x)});
		
		return collisions;
	}
}


//An axis object. It stores the properties of an axis.
// Parameters types: ("Object with 'scene', 'renderer' and 'camera' and 'redraw' method() like Plane", 
//						THREE.Vector2=(0,0), hex=0x000000, float=1, float=1, float=1)
class	Axis
{
	constructor(render, center, color=0x000000, dx=1, dy=1, width=1)
	{
		// Object that contains the scene where the axis will be drawn.
		// Must contain a 'redraw' method that renders the scene.
		this.render = render;
		//The cartesian coordinates of the center of the axis.
		this.center = (center === undefined ? new THREE.Vector2(0, 0) : center);
		//The color of the axis.
		this.color = color;
		//The cartesian horizontal space between the marks.
		this.dx = dx;
		//The cartesian vertical space between the marks.
		this.dy = dy;
		// The width of the axis.
		// NOTE: It seems that due to limitations in the OpenGL Core Profile, the linewidth will always be '1'
		// regardless of the set value. (https://threejs.org/docs/index.html#api/en/materials/LineBasicMaterial)
		this.width = width;
		
		// If the axis and marks are shown or not.
		this.showaxis = true;
		this.showmarks = true;
		// We will store the axis separate from the marks in THREE.LineSegments objects.
		// To make it possible to hide the marks independent of the axis.
		this.axis = null;
		this.marks = null;
	}
	
	// Construct the axis and render it.
	makeAxis()
	{
		// If there is already an axis, remove it from the scene.
		if (this.axis != null) this.render.scene.remove(this.axis);
		
		var material = new THREE.LineBasicMaterial({color:this.color, linewidth:this.width});
		var geometry = new THREE.Geometry();
		
		geometry.vertices.push(new THREE.Vector3(this.render.box.left, this.center.y, -0.1));
		geometry.vertices.push(new THREE.Vector3(this.render.box.right, this.center.y, -0.1));
		geometry.vertices.push(new THREE.Vector3(this.center.x, this.render.box.bottom, -0.1));
		geometry.vertices.push(new THREE.Vector3(this.center.x, this.render.box.top, -0.1));
		
		this.axis = new THREE.LineSegments(geometry, material);
		this.render.scene.add(this.axis);
		this.render.redraw();
	}
	
	// Show/Hide the axis.
	setVisibilityAxis(visible)
	{
		if (this.axis == null) return;
		this.axis.visible = visible;
		this.render.redraw();
	}
	
	// Construct the marks and render them.
	makeMarks()
	{
		// If there are already marks, remove them from the scene.
		if (this.marks != null) this.render.scene.remove(this.marks);
		
		// We want to make the marks as long as 7 pixels, so we compute the size of a pixel in cartesian coordinates.
		var pix_dx = (this.render.box.right - this.render.box.left) / this.render.width;
		var pix_dy = (this.render.box.top - this.render.box.bottom) / this.render.height;
		
		var material = new THREE.LineBasicMaterial({color:this.color, linewidth:this.width});
		var geometry = new THREE.Geometry();
		
		// Right horizontal side.
		for (var x = this.center.x; x <= this.render.box.right; x += this.dx)
		{
			geometry.vertices.push(new THREE.Vector3(x, -3 * pix_dy + this.center.y, -0.1));
			geometry.vertices.push(new THREE.Vector3(x, 3 * pix_dy + this.center.y, -0.1));
		}
		// Left horizontal side.
		for (var x = this.center.x; x >= this.render.box.left; x -= this.dx)
		{
			geometry.vertices.push(new THREE.Vector3(x, -3 * pix_dy + this.center.y, -0.1));
			geometry.vertices.push(new THREE.Vector3(x, 3 * pix_dy + this.center.y, -0.1));
		}
		
		// Top vertical side.
		for (var y = this.center.y; y <= this.render.box.top; y += this.dy)
		{
			geometry.vertices.push(new THREE.Vector3(-3 * pix_dx + this.center.x, y, -0.1));
			geometry.vertices.push(new THREE.Vector3(3 * pix_dx + this.center.x, y, -0.1));
		}
		// Bottom vertical side.
		for (var y = this.center.y; y >= this.render.box.bottom; y -= this.dy)
		{
			geometry.vertices.push(new THREE.Vector3(-3 * pix_dx + this.center.x, y, -0.1));
			geometry.vertices.push(new THREE.Vector3(3 * pix_dx + this.center.x, y, -0.1));
		}
		
		this.marks = new THREE.LineSegments(geometry, material);
		this.render.scene.add(this.marks);
		this.render.redraw();
	}
	
	// Show/Hide the marks.
	setVisibilityMarks(visible)
	{
		if (this.marks == null) return;
		this.marks.visible = visible;
		this.render.redraw();
	}
	
	// Remove and destroy axis and marks from the scene.
	remove()
	{
		this.render.scene.remove(this.axis);
		this.render.scene.remove(this.marks);
		this.axis = null;
		this.marks = null;
		this.render.redraw();
	}
	
	// Make axis and marks and add them to the scene.
	make()
	{
		this.makeAxis();
		this.makeMarks();
	}
	
	// Changes the color of the axis and the marks.
	// Parameters types: (hex)
	changeColor(color)
	{
		this.color = color;
		this.axis.material.color.setHex(color);
		this.marks.material.color.setHex(color);
		this.render.redraw();
	}
	
	// Changes the color of the axis and the marks.
	// Parameters types: (float)
	// NOTE: It seems that due to limitations in the OpenGL Core Profile, the linewidth will always be '1'.
	// regardless of the set value. (https://threejs.org/docs/index.html#api/en/materials/LineBasicMaterial)
	changeWidth(width)
	{
		this.width = width;
		this.axis.material.linewidth = width;
		this.marks.material.linewidth = width;
		this.render.redraw();
	}
}


class	Plane
{
	constructor(divID, width, height, bgColor=0x000000)
	{
		this.divID = divID;
		this.width = (width === undefined ? $("#"+this.divID).width() : width);
		this.height = (height === undefined ? $("#"+this.divID).height() : height);
		this.bgColor = bgColor;
		
		this.box = new Box(-0.5 * this.width / 50, -0.5 * this.height / 50, 0.5 * this.width / 50, 0.5 * this.height / 50);
		this.pix_dx = (this.box.right - this.box.left) / this.width;
		this.pix_dy = (this.box.top - this.box.bottom) / this.height;
		
		// The scene.
		this.scene = new THREE.Scene();
		// Two cameras, one for 2D view and the other for a 3D perpective.
		this.camera = new THREE.OrthographicCamera(this.box.left, this.box.right, this.box.top, this.box.bottom, 0.1, 30);
		this.camera3D = new THREE.PerspectiveCamera(60, this.width / this.height, 0.1, 100);
		// The renderer.
		this.renderer = new THREE.WebGLRenderer({antialias:true});
		// The plane that will work as the background.
		this.background = null;
		
		// The context will indicate the camera used in the rendering ("2D" or "3D").
		this.context = "2D"
		
		// Set the div and the renderer sizes.
		$("#"+this.divID).width(this.width);
		$("#"+this.divID).height(this.height);
		this.renderer.setSize(this.width, this.height);
		
		// Append the renderer as a child of the div element.
		$("#"+this.divID).append(this.renderer.domElement);
		
		// Set the cameras position and look vector.
		this.camera.position.set(0, 0, 1);
		this.camera.lookAt(0, 0, 0);
		this.camera3D.position.set(0, 0, 20);
		this.camera3D.lookAt(0, 0, 0);
		
		// Ortbit controls for the 3D camera.
		this.orbitControls = new THREE.OrbitControls(this.camera3D);
		this.orbitControls.target.set(0, 0, 0);
		this.orbitControls.minAzimuthAngle = -2 * Math.PI / 10;
		this.orbitControls.maxAzimuthAngle = 2 * Math.PI / 10;
		this.orbitControls.minPolarAngle =  3 * Math.PI / 10;
		this.orbitControls.maxPolarAngle =  7 * Math.PI / 10;
		
		/*this.light = new THREE.AmbientLight(0x404040);
		this.light = new THREE.PointLight(0xff0000, 3, 100, 2);
		*/
		this.light = new THREE.DirectionalLight(0xffffff, 2);
		this.light.position.set(0, 0, 20);
		this.scene.add(this.light);
		
		// ELEMENTS DRAWN IN THE SCENE.
		// The array of axis, we will allow multiple axis through different centers.
		this.axis = [];
		
		this.makeBackground();
		this.redraw();
	}
	
	// Create the background plane.
	makeBackground()
	{
		var bgGeometry = new THREE.PlaneGeometry(this.box.right - this.box.left, this.box.top - this.box.bottom);
		var bgMaterial = new THREE.MeshBasicMaterial({color: this.bgColor});
		this.background = new THREE.Mesh(bgGeometry, bgMaterial);
		this.background.position.set(0.5 * (this.box.right + this.box.left), 0.5 * (this.box.top + this.box.bottom), -10);
		this.scene.add(this.background);
	}
	
	// Change the background color.
	// Parameters types: (hex), ex. 0x000000
	changeBackgroundColor(color)
	{
		this.bgColor = color;
		this.background.material.color.setHex(this.bgColor);
		this.redraw();
	}
	
	// Creates an 'Axis' object and appends it to the 'this.axis' array.
	// Parameters types: (THREE.Vector2=(0,0), hex=0x000000, float=1, float=1, float=1)
	// Return type: Axis
	addAxis(center, color, dx, dy, width)
	{
		var new_axis = new Axis(this, center, color, dx, dy, width);
		new_axis.make();
		this.axis.push(new_axis);
		return new_axis;
	}
	
	// Draws continuous line segments through the cartesian points given in the array 'P' of the given 'color' and 'width'.
	// Parameters types: (array<THREE.Vector2>, hex=0x000000, int=1)
	// Return type: THREE.Line
	lineSegments(P, color=0x000000, width=1)
	{
		var material = new THREE.LineBasicMaterial({color:color, linewidth:width});
		var geometry = new THREE.Geometry();
		
		for (var i = 0; i < P.length; ++i)
			geometry.vertices.push(new THREE.Vector3(P[i].x, P[i].y, 0));
		
		var line = new THREE.Line(geometry, material);
		line.position.z = 0;
		this.scene.add(line);
		this.redraw();
		return line;
	}
	
	// Draws a circle in the given 'center', of the given 'radius' and of the given 'color'.
	// Parameters types: (THREE.Vector2, float=1, hex=0x000000)
	// Return type: THREE.Mesh
	circle(center, radius=1, color=0x000000)
	{
		// To make a smooth shape, we will request a number of segments that depends on the radius of the circle, since
		// the curvature of the circumference = 1 / radius. So at greater radius more like a line is the circle locally.
		// The idea is to obtain the number of pixels where a tangent line is at most 1/6 of a pixel away from the circle
		// around the intersection.
		// The cartesian distance around the intersection where the tangent is exactly at distance 'd' from the circle 
		// is twice the solution of: r - sqrt(r^2 - x^2) = d
		// So the distance is (twice the solution of the equation): 2 * sqrt(2 * r * d - d^2)
		// Tehrefore, the nomber of pixels that this distance represents is: [2 * sqrt(2 * r * d - d^2)] / pixel_size
		var pixel_size = Math.max(this.pix_dx, this.pix_dy);
		var d = pixel_size / 6.0;
		var neigh_length = parseInt((2 * Math.sqrt(2 * radius * d - d ** 2)) / pixel_size);
		// To obtain the number of segments we get the perimeter in pixels and divide it by the length of the segments.
		var segments = parseInt((2 * Math.PI * radius) / (neigh_length * pixel_size));
		
		var geometry = new THREE.CircleGeometry(radius, segments);
		var material = new THREE.MeshBasicMaterial({color: color});
		var circle = new THREE.Mesh(geometry, material);
		circle.position.z = 0;
		
		this.scene.add(circle);
		this.redraw();
		
		return circle;
	}
	
	// Draws a rectangle centered at 'center', of the given 'width' and 'height' of the given 'color'.
	// Parameters types: (THREE.Vector2, float=1, float=1, hex=0x000000)
	// Return type: THREE.Mesh
	rectangleCentered(center, width=1, height=1, color=0x000000)
	{
		var geometry = new THREE.PlaneGeometry(width, height);
		var material = new THREE.MeshBasicMaterial({color:color, side:THREE.FrontSide});
		var rectangle = new THREE.Mesh(geometry, material);
		rectangle.position.set(center.x, center.y, 0);
		
		this.scene.add(rectangle);
		this.redraw();
		
		return rectangle;
	}
	
	// Draws a rectangle bounded by the given box of the given 'color'.
	// Parameters types: (Box, hex=0x000000)
	// Return type: THREE.Mesh
	rectangleBoxed(box, color)
	{
		return this.rectangleCentered(new THREE.Vector2(0.5 * (box.left + box.right), 0.5 * (box.bottom + box.top)), Math.abs(box.right - box.left), Math.abs(box.top - box.bottom), color);
	}
	
	// Creates a line representing a function 'f', over 'N' sample points.
	// Parameters types: (function=sin(x), int=100)
	// Return type: THREE.Line
	plotFunction(f=(x => Math.sin(x)), N=100)
	{
		var a = this.box.left;
		var b = this.box.right;
		var x;
		var P = [];
		
		for (var t = 0; t <= N; ++t)
		{
			x = [(N - t) * a + t * b] / N;
			P.push(new THREE.Vector2(x, f(x)));
		}
		
		return this.lineSegments(P);
	}
	
	// Reconstructs all the axis. Useful in case that the box has changed.
	updateAxis()
	{
		for (var i = 0; i < this.axis.length; ++i)
		{
			this.axis[i].remove();
			this.axis[i].make();
		}
	}
	
	// Changes the volume of view that the camera renders. Useful in case that the box has changed.
	// Parameters types: (float, float, float, float, float=0.1, float=30)
	// Return type: void
	changeCameraFrustrum(box, near=0.1, far=30)
	{
		this.camera.left = box.left;
		this.camera.bottom = box.bottom;
		this.camera.right = box.right;
		this.camera.top = box.top;
		this.camera.near = near;
		this.camera.far = far;
		this.camera.updateProjectionMatrix();
	}
	
	// Updates or reconstructs all the dinamic objects that we have in the canvas.
	updateAll()
	{
		this.pix_dx = (this.box.right - this.box.left) / this.width;
		this.pix_dy = (this.box.top - this.box.bottom) / this.height;
		this.changeCameraFrustrum(this.box);
		this.scene.remove(this.background);
		this.makeBackground();
		this.updateAxis();
	}
	
	// Changes the cartesian domain that we want to view in the canvas.
	// Parameters types: (float, float, float, float)
	// Return type: void
	changeBox(box)
	{
		//Make sure that left < right and bottom < top
		box.fix();
		
		this.box = box;
		this.updateAll();
	}
	
	// Changes the box proportionally, taking as base the given box. The new box will be propostional and will 
	// satisfy that the given 'side' ("h"=horizontal, "v"=vertical) exactly fits the same side of the canvas.
	// If no side is given, then it will be chosen the one that makes the box be completely inside the canvas.
	// Parameters types: (Box, char)
	// Return type: void
	changeBoxProportional(box, side)
	{
		box = box || this.box;
		
		//Make sure that left < right and bottom < top
		box.fix();
		// Of no side chosen, chose the one that makes the fit inside the view.
		side = (side === undefined ? (this.height * (box.right - box.left) >= this.width * (box.top - box.bottom) ? "h" : "v") : side);
		
		var aux = 0;
		var dh = 0;
		var dv = 0;
		if(side[0] == "h")
		{
			aux = box.top - box.bottom; //Auxiliary for centering the box.
			dv = this.height * (box.right - box.left) / this.width;
			box.top = box.bottom + dv;
			aux = (box.top - box.bottom - aux) / 2; //The vertical offset for the centering.
			box.bottom -= aux;
			box.top -= aux;
		}
		else
		{
			aux = box.right - box.left; //Auxiliary for centering the box.
			dh = this.width * (box.top - box.bottom) / this.height;
			box.right = box.left + dh;
			aux = (box.right - box.left - aux) / 2; //The horizontal offset for the centering.
			box.left -= aux;
			box.right -= aux;
		}
		
		this.changeBox(box);
	}
	
	// Removes the object from the scene.
	removeObject(object)
	{
		this.scene.remove(object);
		this.redraw();
	}
	
	// Set the rendering context ("2D" or "3D")
	setContext(context)
	{
		this.context = context;
	}
	
	// Draw the scene.
	redraw()
	{
		if (this.context == "3D") this.renderer.render(this.scene, this.camera3D);
		else this.renderer.render(this.scene, this.camera);
	}
}


class	Tetra	extends	Plane
{
	constructor(divID, width, height, bgColor)
	{
		super(divID, width, height, bgColor);
		
		// Size of the grid.
		this.blocksWidth = 10;
		this.blocksHeight = 20;
		
		// Makers of textures and shapes.
		this.textures = new Textures();
		this.shapes = new Shapes();
		this.audios = null;
		
		// The grid that will store the blocks already placed.
		this.board = new Board(this, this.blocksWidth, this.blocksHeight, new THREE.Vector2(0,0));
		this.boardBox = new Box(0, 0, this.blocksWidth - 1, this.blocksHeight - 1);
		this.boardBox.move(this.board.origin);
		
		this.nextPieceBoard = new Board(this, 5, 5, new THREE.Vector2(this.blocksWidth + 4, this.blocksHeight / 2 - 2));
		
		// To track the time.
		this.prevTime = null;
		// Speed of the pieces movement, in miliseconds.
		// A piece will move every this number of miliseconds.
		this.speed = 500;
		
		this.nextFrame = null;
		
		this.currentPiece = null;
		this.nextPiece = null;
		
		this.state = "waiting_start";
		this.lines = [];
		
		this.blinks = 0;
		this.endBlocks = 0;
		this.endMode = "show";
		
		// Set the target of the orbit controls.
		this.orbitControls.target.set(this.blocksWidth / 2, this.blocksHeight / 2, 0);
		this.camera3D.position.set(this.blocksWidth / 2, this.blocksHeight / 2, 20);
		this.camera3D.lookAt(this.blocksWidth / 2, this.blocksHeight / 2, 0);
		
		// Prepare the view.
		this.changeBoxProportional(new Box(0 - 3, 0 - 2, this.blocksWidth + 3 + 9, this.blocksHeight + 2));
		//this.addAxis();
		
		window.addEventListener('keydown', this.onKeyDown.bind(this), false);
	}
	
	animate(time)
	{
		this.nextFrame = requestAnimationFrame(this.animate.bind(this));
		
		var currentTime = Date.now();
		
		if (this.state == "playing")
		{
			if (currentTime - this.prevTime >= this.speed && this.state == "playing")
				this.moveDown();
		}
		else if (this.state == "marking_lines")
		{
			if (this.blinks == 0)
			{
				this.board.markLines(this.lines);
				this.blinks += 1;
				this.audios.tracks["blink.ogg"].play();
			}
			
			if (currentTime - this.prevTime >= 300)
			{
				if (this.blinks < 4)
				{
					this.board.blinkMarkedLines();
					if (this.audios.tracks["blink.ogg"].isPlaying)
						this.audios.tracks["blink.ogg"].stop();
					else this.audios.tracks["blink.ogg"].play();
					this.blinks += 1;
					this.prevTime = Date.now();
				}
				else
				{
					this.board.clearMarkedLines();
					this.blinks = 0;
					this.audios.tracks["blink.ogg"].stop();
					this.setState("deleting_lines");
				}
			}
		}
		else if (this.state == "deleting_lines")
		{
			this.lines.push(this.blocksHeight);
			for (var i = 0; i < this.lines.length - 1; ++i)
			for (var j = this.lines[i] + 1; j < this.lines[i + 1]; ++j)
				this.board.moveLine(j, -(i + 1));
			this.board.clearLine(this.height - 1);
			
			this.prevTime = Date.now();
			this.setState("test_game_over");
		}
		else if (this.state == "test_game_over")
		{
			if (this.board.blockOnTop())
			{
				console.log("GAME OVER");
				this.nextPiece.remove();
				this.audios.tracks["tetris.ogg"].stop();
				this.audios.tracks["tetris.ogg"].play();
				this.setState("end_spiral");
			}
			else
				// Back to play.
				this.setState("playing");
		}
		else if (this.state == "end_spiral")
		{
			if (currentTime - this.prevTime >= 10)
			{
				if (this.endBlocks < this.blocksWidth * this.blocksHeight)
				{
					this.board.nextBoardSpiral(this.endMode);
					this.endBlocks += 1;
				}
				else
				{
					if (this.endMode == "show")
					{
						this.audios.tracks["tetris.ogg"].stop();
						this.endMode = "hide";
						this.board.makeBackground("end_img");
					}
					else
					{
						this.setState("end");
						this.board.changeFrameTexture("heart");
						this.nextPieceBoard.changeFrameTexture("heart");
						this.nextPieceBoard.makeBackground("background_heart");
						
						var geometry = new THREE.PlaneGeometry(this.box.right - this.box.left, this.box.top - this.box.bottom);
						var material = new THREE.MeshBasicMaterial({map:this.textures.maps["background"]});
						this.background = new THREE.Mesh(geometry, material);
						this.background.position.set(0.5 * (this.box.right + this.box.left), 0.5 * (this.box.top + this.box.bottom), -10);
						this.scene.add(this.background);
					}
					
					this.endBlocks = 0;
					this.board.resetSpiralState();
				}
				this.prevTime = Date.now();
			}
		}
		else if (this.state == "end")
		{
			if (currentTime - this.prevTime >= 500)
			{
				if (this.board.frame[0].block.material.map == this.textures.maps["heart"])
				{
					this.board.changeFrameTexture("dark");
					this.nextPieceBoard.changeFrameTexture("dark");
				}
				else 
				{
					this.board.changeFrameTexture("heart");
					this.nextPieceBoard.changeFrameTexture("heart");
				}
				this.prevTime = Date.now();
			}
		}
		
		this.orbitControls.update();
		this.redraw();
	}
	
	onKeyDown(event)
	{
		switch (event.keyCode)
		{
			case 37: if (this.state == "playing") this.moveLeft();
				break;
			case 39: if (this.state == "playing") this.moveRight();
				break;
			case 40: if (this.state == "playing") this.moveDown();
				break;
			case 32: if (this.state == "playing") this.roratePiece();
				break;
		}
	}
	
	moveLeft()
	{
		var collisions = this.board.collisionPiece(this.currentPiece, true);
		
		if (!collisions["left"])
			this.currentPiece.move(new THREE.Vector2(-1, 0));
	}
	
	moveRight()
	{
		var collisions = this.board.collisionPiece(this.currentPiece, true);
		
		if (!collisions["right"])
			this.currentPiece.move(new THREE.Vector2(1, 0));
	}
	
	moveDown()
	{
		var collisions = this.board.collisionPiece(this.currentPiece, true);
		
		if (collisions["bottom"])
		{
			this.board.addPiece(this.currentPiece, "absolute");
			this.currentPiece = this.nextPiece;
			this.currentPiece.visibleBox.setFromBox(this.boardBox);
			this.currentPiece.setOrigin((new THREE.Vector2(this.randomInt(0, this.blocksWidth - 3), this.blocksHeight)).add(this.board.origin));
			
			this.nextPiece = this.createPiece(true);
			
			this.lines = this.board.fullLines();
			if (this.lines.length > 0)
				this.setState("marking_lines");
			else
				this.setState("test_game_over");
		}
		
		if (this.state == "playing")
			this.currentPiece.move(new THREE.Vector2(0,-1));
		this.prevTime = Date.now();
	}
	
	roratePiece()
	{
		var collisions = null;
		
		this.currentPiece.rotate();
		collisions = this.board.collisionPiece(this.currentPiece, true);
		if (collisions["over"]) this.currentPiece.rotate(1);
	}
	
	createPiece(visible)
	{
		var shape = this.shapes.names[this.randomInt(0, this.shapes.names.length)];
		var color = this.textures.namesColors[this.randomInt(0, this.textures.namesColors.length)];
		var position = (new THREE.Vector2(0, 0)).add(this.nextPieceBoard.origin).add(new THREE.Vector2(1,1));
		var visibleBox = this.nextPieceBoard.frameBox.copy();
		
		visibleBox.shrink();
		visibleBox.move(this.nextPieceBoard.origin);
		return new Piece(this, position, shape, undefined, visibleBox, color, "square", visible);
	}
	
	setState(state)
	{
		this.state = state;
	}
	
	startGame()
	{
		// Start execution.
		this.shapes.make();
		this.audios = new Audios();
		
		var texturesPromises = this.textures.loadTextures();
		var audiosPromises = this.audios.loadAudios();
		
		Promise.all(audiosPromises).then(buffers => {
			for (var i = 0; i < this.audios.names.length; ++i)
			{
				this.audios.tracks[this.audios.names[i]] = new THREE.Audio(this.audios.listener);
				this.audios.tracks[this.audios.names[i]].setBuffer(buffers[i]);
				this.audios.tracks[this.audios.names[i]].setLoop(true);
				this.audios.tracks[this.audios.names[i]].setVolume(0.5);
			}
			this.audios.tracks["tetris.ogg"].play();
		});
		
		Promise.all(texturesPromises).then(textures => {
			this.board.createFrame("bricks", "square");
			this.nextPieceBoard.createFrame("dark_fire_block", "square");
			this.currentPiece = this.createPiece(true);
			this.nextPiece = this.createPiece(true);
			
			this.currentPiece.visibleBox.setFromBox(this.boardBox);
			this.currentPiece.setOrigin((new THREE.Vector2(this.randomInt(0, this.blocksWidth - 3), this.blocksHeight)).add(this.board.origin));
			
			this.prevTime = Date.now();
			this.animate(0);
		});
		
		this.setState("playing");
	}
	
	stop()
	{
		cancelAnimationFrame(this.nextFrame);
	}
	
	randomInt(min, max)
	{
		return Math.floor(Math.random() * (max - min) ) + min;
	}
}







