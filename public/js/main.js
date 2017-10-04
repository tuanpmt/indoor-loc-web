// 1. Load all scanner
// 2. Listen and update mover 
var scene, camera, renderer, controls;
var geometry, material, mesh;

init();
animate();

function init() {

	scene = new THREE.Scene();

	camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
	camera.position.z = 1000;

	geometry = new THREE.BoxGeometry(400, 400, 400);
	material = new THREE.MeshBasicMaterial({
		color: 0xf0f000,
		wireframe: true
	});

	mesh = new THREE.Mesh(geometry, material);
	// scene.add(mesh);

	renderer = new THREE.WebGLRenderer({
		antialias: true
	});
	renderer.setClearColor(0xb0b0b0);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);

	controls = new THREE.OrbitControls(camera, renderer.domElement);
	// controls.maxPolarAngle = Math.PI * 0.5;
	// controls.minDistance = 1000;
	// controls.maxDistance = 7500;

	var group = new THREE.Group();
	scene.add(group);

	var helper = new THREE.GridHelper(500, 10);
	helper.position.y = -200;//Math.PI / 2;
	// helper.position.y = 0;//Math.PI / 2;
	group.add(helper);
	group.add(mesh);


	document.body.appendChild(renderer.domElement);

	var socket = io('http://localhost:8080');

	socket.on('news', function(data) {
		console.log(data);
	});

	socket.on('scan', function(data) {
		var decodedString = String.fromCharCode.apply(null, new Uint8Array(data));
		var obj = JSON.parse(decodedString);

		console.log(obj);
		
	});

}

function animate() {

	requestAnimationFrame(animate);

	// mesh.rotation.x += 0.01;
	// mesh.rotation.y += 0.02;
	// camera.position.z += 1;

	renderer.render(scene, camera);

}