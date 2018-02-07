var logger = require('../../logger/logger').logger(__filename);
var path = require('../../../config/config').rest.path;
var service = require('../../services/api/ping/service');

function middleware(req, res) {
	logger.debug('ping post method called');
	service.entry(req.body, function (err, result) {
		if(err) res.send(err);
		else res.sendStatus(result);
	});
}
exports.registerRoutes = function (app) {
	'use strict';
	app.post(path+'ping.post', middleware);
};