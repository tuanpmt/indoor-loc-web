import resource from 'resource-router-middleware';
import { Router } from 'express';
import express from 'express';

export default ({ config, db, io }) => {
	let api = Router();
	// perhaps expose some API metadata at the root
	api.all('/', (req, res) => {
		console.log(req.query);
		io.emit('scan', JSON.stringify(req.query));
		res.status(200);
		res.end();

	});

	return api;
}
