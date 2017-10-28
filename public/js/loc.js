var defaultCoordinator = {
	offsetX: 0,
	offsetY: 0,
	scaleX: 1,
	scaleY: 1,
	zero: {
		x: 0,
		y: 0
	},
	one: {
		x: 100,
		y: 100
	}
}
var coordinator = {};
var activeType = null;
var currentX = 0;
var currentY = 0;

var anchors = [];
var tags = [];
var tags_loc = {};

var canvas;

fabric.Canvas.prototype.getLocObj = function(type, data) {
	var object = null,
		objects = this.getObjects();

	for (var i = 0, len = this.size(); i < len; i++) {
		if (objects[i].data && objects[i].data === data && objects[i].type && objects[i].type === type) {

			object = objects[i];
			break;
		}
	}

	return object;
}
function getAnchor(addr, dist) {

	if(anchors == null) {
		return null;
	}
	for (var i = 0; i < anchors.length; i++) {
		if(anchors[i].addr === parseInt(addr, 16)) {
			return {
				x: anchors[i].x,
				y: anchors[i].y,
				addr: addr,
				dist: dist
			};
		}
	}
	return null;
}
function getCoordinator(loc0, loc1, loc2) {
	var a = -2 * (loc0.x - loc1.x);
	var b = -2 * (loc0.y - loc1.y);
	var c = -2 * (loc0.x - loc2.x);
	var d = -2 * (loc0.y - loc2.y);
	var e = Math.pow(loc0.dist, 2) - Math.pow(loc1.dist, 2) - Math.pow(loc0.x, 2) + Math.pow(loc1.x, 2) - Math.pow(loc0.y, 2) + Math.pow(loc1.y, 2);
	var f = Math.pow(loc0.dist, 2) - Math.pow(loc2.dist, 2) - Math.pow(loc0.x, 2) + Math.pow(loc2.x, 2) - Math.pow(loc0.y, 2) + Math.pow(loc2.y, 2);

	var x = (e * d - b * f) / (a * d - b * c);
	var y = (a * f - c * e) / (a * d - b * c);
	return {
		x: x,
		y: y
	}
}

function resetAnchors() {
	if(anchors == null) {
		return;
	}
	for (var i = 0; i < anchors.length; i++) {
		if(anchors[i] && anchors[i].addr) {
			var obj = canvas.getLocObj('anchor', anchors[i].addr.toString(16));
			if (obj) {
				console.log('remove', obj);
				// obj.remove();
				canvas.remove(obj);
			}
		}
		
	}
	anchors = [];
	canvas.renderAll();
	localStorage.setItem("anchors", JSON.stringify([]));
}

function saveAnchors() {
	localStorage.setItem("anchors", JSON.stringify(anchors));
}

function loadAnchors() {
	anchors = JSON.parse(localStorage.getItem("anchors"));
	if(anchors) {
		for (var i = 0; i < anchors.length; i++) {
			var c = translate(anchors[i].x, anchors[i].y);
			createObject(c.x, c.y, 'anchor', anchors[i].addr.toString(16));
		}
	} 
	
}

function addAnchorIfNotExist(addr)
{
	var exist = false;
	if(anchors == null) {
		return;
	}
	for (var i = 0; i < anchors.length; i++) {
		// var c = translate(anchors[i].x, anchors[i].y);
		// console.log(anchors[i].addr.toString(16) , addr.toString(16));
		if(anchors[i].addr == addr) {
			exist = true;
			break;
		}
		
	}
	// console.log(exist);
	if(!exist) {
		var anchor = {
			x: Math.random()*10,
			y: Math.random()*10,
			addr: addr
		};
		addObj(addr, anchor.x, anchor.y, 'anchor');
		saveAnchors();
	}
}


function reset_calibrate() {
	coordinator = defaultCoordinator;
	saveCoordinator();
}

function calibrate() {
	if (activeType == 'plus-0') {
		var x = parseFloat(document.getElementById('scalex').value) - currentX;
		var y = parseFloat(document.getElementById('scaley').value) - currentY;
		coordinator.offsetX = x;
		coordinator.offsetY = y;
	}

	if (activeType == 'plus-1') {
		var rx = coordinator.offsetX + currentX;
		var ry = coordinator.offsetY + currentY;
		var x = parseFloat(document.getElementById('scalex').value);
		var y = parseFloat(document.getElementById('scaley').value);

		coordinator.scaleX = x / rx;
		coordinator.scaleY = y / ry;
		// console.log(rx, ry, x, y, coordinator);
	}
	saveCoordinator();
}

function saveCoordinator() {
	localStorage.setItem("coordinator", JSON.stringify(coordinator));
}

function loadCoordinator() {
	coordinator = JSON.parse(localStorage.getItem("coordinator"));
	if (!coordinator) {
		coordinator = defaultCoordinator;
		saveCoordinator()
	}
}

function loadSVG(url, type, x, y, w, h, cb) {
	fabric.loadSVGFromURL(url, function(objects, options) {
		var loadedObjects = fabric.util.groupSVGElements(objects, {
			top: y,
			left: x,
			lockScalingX: true,
			lockScalingY: true,
			hasControls: false,
			hasBorders: false,
			originX: 'center',
			originY: 'center',
		});

		loadedObjects.type = type;
		loadedObjects.scaleToWidth(w);
		loadedObjects.scaleToHeight(h);

		if (cb) {
			cb(loadedObjects);
		}
	});
}

function createObject(x, y, type, txt) {
	var text = new fabric.Text(txt, {
		top: 0,
		left: 0,
		fontSize: 10,
		originX: 'center',
		originY: 'center',
		fontFamily: 'Comic Sans',
		fontWeight: 'bold',
	});

	loadSVG(`/${type}.svg`, type, 0, 15, 20, 20, (obj) => {

		var group = new fabric.Group([obj, text], {
			left: x,
			top: y,
			lockScalingX: true,
			lockScalingY: true,
			hasControls: false,
			hasBorders: false,
			originX: 'center',
			originY: 'center'
		});
		group.type = type;
		group.data = txt;

		canvas.add(group);
		canvas.renderAll();
	});
}

function translate(x, y) {
	var ret = {
		x: x / coordinator.scaleX - coordinator.offsetX,
		y: y / coordinator.scaleY - coordinator.offsetY
	}
	return ret;
}

function addAnchorClick() {
	addObj();
	saveAnchors();
}

function addObj(a, x, y, type) {
	var addr = a || parseInt(document.getElementById('addr').value, 16);
	var locx = x || parseFloat(document.getElementById('locx').value);
	var locy = y || parseFloat(document.getElementById('locy').value);
	var objType = type || 'anchor'
	if (addr == NaN || locx == NaN || locy == NaN)
		return;
	if(objType == 'tag') {
		if(x == Infinity || x == -Infinity || x == NaN ||
			y == Infinity || y == -Infinity || y == NaN) {
			return;
		}
		for(var i=0; i<tags.length; i++) {
			if(addr == tags[i].addr) {
				var a = canvas.getLocObj(objType, addr.toString(16));
				var coord = translate(locx, locy);
				if(a) {
					a.top = coord.y;
					a.left = coord.x;
					canvas.renderAll();
				}
				
				return;
			}
		}
		
		var tag = {
			x: locx,
			y: locy,
			addr: addr
		}
		tags.push(tag);
		var real_coor = translate(locx, locy);
		createObject(real_coor.x, real_coor.y, objType, addr);
	
		return;
	}
	// console.log(canvas.getLocObj('anchor', addr.toString(16)));
	for (var i = 0; i < anchors.length; i++) {
		if (anchors[i] && anchors[i].addr == addr) {
			anchors[i].x = locx;
			anchors[i].y = locy;
			var a = canvas.getLocObj(objType, addr.toString(16));
			var coord = translate(locx, locy);
			if (a) {
				a.top = coord.y;
				a.left = coord.x;
				canvas.renderAll();
			}
			return;
		}
	}
	var anchor = {
		addr: addr,
		x: locx,
		y: locy
	};
	var real_coor = translate(anchor.x, anchor.y);
	anchors.push(anchor);
	
	
	createObject(real_coor.x, real_coor.y, objType, anchor.addr.toString(16));
}

function init() {
	loadCoordinator();

	canvas = new fabric.Canvas('map', {
		width: 1200,
		height: 800
	});
	// resetAnchors();
	loadAnchors();

	loadSVG('/plus0.svg', 'plus-0', coordinator.zero.x, coordinator.zero.y, 50, 50, (obj) => {
		canvas.add(obj);
		canvas.renderAll();
	});
	loadSVG('/plus.svg', 'plus-1', coordinator.one.x, coordinator.one.y, 50, 50, (obj) => {
		canvas.add(obj);
		canvas.renderAll();
	});

	canvas.setBackgroundColor({
		source: '/bg1.png'
	}, canvas.renderAll.bind(canvas));

	canvas.on('object:moving', function(options) {
		activeType = options.target.type;
		currentX = options.target.left;
		currentY = options.target.top;



		if (activeType == 'plus-0') {
			coordinator.zero.x = currentX;
			coordinator.zero.y = currentY;
			document.getElementById('scalex').value = (coordinator.offsetX + currentX) * coordinator.scaleX;
			document.getElementById('scaley').value = (coordinator.offsetY + currentY) * coordinator.scaleY;
			saveCoordinator();
		}
		if (activeType == 'plus-1') {
			coordinator.one.x = currentX;
			coordinator.one.y = currentY;
			document.getElementById('scalex').value = (coordinator.offsetX + currentX) * coordinator.scaleX;
			document.getElementById('scaley').value = (coordinator.offsetY + currentY) * coordinator.scaleY;
			saveCoordinator();
		}
		// console.log(activeType);
		if(activeType == 'anchor') {
			var anchor = canvas.getLocObj('anchor', options.target.data);
			for (var i = 0; i < anchors.length; i++) {
				if (anchors[i] && anchors[i].addr.toString(16) == options.target.data) {
					anchors[i].x = (coordinator.offsetX + currentX) * coordinator.scaleX;
					anchors[i].y = (coordinator.offsetY + currentY) * coordinator.scaleY;
				}
			}
			// console.log(anchor, options.target.data);
			saveAnchors();
			
		}

	});
	var loadFile = function(e) {
		var reader = new FileReader();
		reader.onload = function(event) {
			var imgObj = new Image();
			imgObj.src = event.target.result;
			imgObj.onload = function() {
				var image = new fabric.Image(imgObj);
				image.scaleToWidth(canvas.getWidth());
				// image.set({
				// 	angle: 0,
				// 	padding: 10,
				// 	cornersize: 10,
				// 	height: 110,
				// 	width: 110,
				// });
				// canvas.centerObject(image);
				canvas.setBackgroundImage(image);
				// canvas.add(image);
				canvas.renderAll();
			}
		}
		reader.readAsDataURL(e.target.files[0]);
	}
	var socket = io(window.location.hostname + ':2222');
	// console.log(window.location.hostname);
	
	socket.on('scan', function(data) {
		// var decodedString = String.fromCharCode.apply(null, new Uint8Array(data));
		// console.log(decodedString, data);
		var obj = JSON.parse(data);
		addAnchorIfNotExist(parseInt(obj.anchor, 16));
		// var loc0 = getAnchor(obj.addr0);
		// if(loc0) {
		// 	loc0.dist = obj.dist0;
		// }

		// var loc1 = getAnchor(obj.addr1);
		// if(loc1) {
		// 	loc1.dist = obj.dist1;
		// }

		// var loc2 = getAnchor(obj.addr2);
		// if(loc2) {
		// 	loc2.dist = obj.dist2;
		// }

		// if(loc0 && loc1 && loc2) {
		// 	var tag_loc = getCoordinator(loc0, loc1, loc2);
		// 	console.log(tag_loc);
		// }
		// var tag = canvas.getLocObj('tag', obj.tag);
		// if(tag) {
		// 	//move
		// } else {
		// 	//add new
		// }
		
		if(!tags_loc[obj.tag]) {
			tags_loc[obj.tag] = {};
		}
		if(!tags_loc[obj.tag]['seq_' + obj.seq]) {
			tags_loc[obj.tag]['seq_' + obj.seq] = [];
		}
		tags_loc[obj.tag]['seq_' + obj.seq].push({
			anchor: getAnchor(obj.anchor, obj.dist),
			dist: obj.dist
		})
		if(tags_loc[obj.tag]['seq_' + obj.seq].length >= 3) {
			console.log(tags_loc[obj.tag]['seq_' + obj.seq]);
			var loc = getCoordinator(
				tags_loc[obj.tag]['seq_' + obj.seq][0].anchor, 
				tags_loc[obj.tag]['seq_' + obj.seq][1].anchor,
				tags_loc[obj.tag]['seq_' + obj.seq][2].anchor);
			console.log(loc);
			addObj(obj.tag, loc.x, loc.y, 'tag');
			delete tags_loc[obj.tag]['seq_' + obj.seq];
		}
		console.log(obj);

	});
}

init();