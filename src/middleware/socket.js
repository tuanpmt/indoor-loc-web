import socketio from 'socket.io';
import { Router } from 'express';
// const WebSocket = require('ws');

export default (server) => {
	let io = socketio(server);
	// let wss = new WebSocket.Server({ server });
	let routes = Router();
	
	io.on('connection', function (socket) {
	  console.log('connected');
	});

	// wss.on('connection', function connection(ws, req) {
	// 	console.log('connected');
	// 	ws.on('message', function incoming(message) {
	// 	    console.log('received: %s', message);
	// 	    // ws.send('data: ' + message);
	// 	    io.emit('scan', message);
	// 	});
	// });
	
	// routes.ws = wss;
	routes.io = io;
	server.io = server;
	return routes;
}
