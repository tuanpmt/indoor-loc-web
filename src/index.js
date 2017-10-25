import http from 'http';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import bodyParser from 'body-parser';
import initializeDb from './db';
import middleware from './middleware';
import socketio from './middleware/socket';
import api from './api';
import scanner from './api/scanner';
import config from './config.json';
import path from 'path';

let app = express();
app.server = http.createServer(app);

// logger
app.use(morgan('dev'));

// 3rd party middleware
app.use(cors({
	exposedHeaders: config.corsHeaders
}));

app.use(bodyParser());
// connect to db
initializeDb( db => {
	var socket = socketio(app.server);
	var io = socket.io;
	// internal middleware
	app.use(middleware({ config, db }));

	app.use(socket);

	// api router
	app.use('/api', api({ config, db }));

	app.use('/scan', scanner({ config, db, io }));

	app.use('/', express.static(path.join(__dirname, '../public')))

	app.server.listen(process.env.PORT || config.port, () => {
		console.log(`Started on port ${app.server.address().port}`);
		console.log(`NODE_ENV = ${process.env.NODE_ENV}`);
	});
});

export default app;
