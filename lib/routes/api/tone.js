var logger = require('../../logger/logger').logger(__filename);
var path = require('../../../config/config').rest.path;
var service = require('../../services/api/tone/service');

function middleware(req, res) {
	logger.debug('translator post method called');
	service.entry(req.body, function (err, result) {
		if(err) res.send(err);
		else res.send(result);
	});
}
exports.registerRoutes = function (app) {
	'use strict';
	app.post(path+'tone', middleware);
	app.post(path+'tone.route',middleware);
};
