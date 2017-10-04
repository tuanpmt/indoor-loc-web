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

function getLocation(loc0, loc1, loc2)
{
	//loc0.x, loc0.y, loc0.dist
	//d0 = sqrt(pow(x-x0) + pow(y-y0))
	//d1 = sqrt(pow(x-x1) + pow(y-y1))
	
}
function resetAnchors() {
	for(var i=0; i<anchors.length; i++) {
		var obj = canvas.getLocObj('anchor', anchors[i].addr.toString(16));
		if(obj) {
			console.log('remove', obj);
			// obj.remove();
			canvas.remove(obj);
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
	for(var i=0; i<anchors.length; i++) {
		var c = translate(anchors[i].x, anchors[i].y);
		createObject(c.x, c.y, 'anchor', anchors[i].addr.toString(16));
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
		x: x/coordinator.scaleX - coordinator.offsetX,
		y: y/coordinator.scaleY - coordinator.offsetY
	}
	return ret;
}
function addAnchorClick() {
	addAnchor();
	saveAnchors();
}
function addAnchor(a, x, y) {
	var addr = a || parseInt(document.getElementById('addr').value, 16);
	var locx = x || parseFloat(document.getElementById('locx').value);
	var locy = y || parseFloat(document.getElementById('locy').value);
	if(addr == NaN || locx == NaN || locy == NaN)
		return;
	console.log(canvas.getLocObj('anchor', addr.toString(16)));
	for(var i=0; i<anchors.length; i++) {
		if(anchors[i] && anchors[i].addr == addr) {
			anchors[i].x = locx;
			anchors[i].y = locy;
			var a = canvas.getLocObj('anchor', addr.toString(16));
			var coord = translate(locx, locy);
			if(a) {
				a.top = coord.y;
				a.left = coord.x;
				canvas.renderAll();
			}
			return;
		}
	}
	var anchor = {addr: addr, x: locx, y: locy};
	var real_coor = translate(anchor.x, anchor.y);
	anchors.push(anchor);
	createObject(real_coor.x, real_coor.y, 'anchor', anchor.addr.toString(16));
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
	var socket = io('http://localhost:8080');

	socket.on('scan', function(data) {
		// var decodedString = String.fromCharCode.apply(null, new Uint8Array(data));
		// console.log(decodedString, data);
		var obj = JSON.parse(data);

		console.log(obj);
		
	});
}

init();