/* list of all routes */
var translatorRoute = require('./api/translator');
var pingRoute = require('./api/ping');
var sentimentsRoute = require('./api/sentiments');
var toneRoute = require('./api/tone');
var conversationRoute = require('./api/conversation');



function register(app)
{
	translatorRoute.registerRoutes(app);
	pingRoute.registerRoutes(app);
	sentimentsRoute.registerRoutes(app);
	toneRoute.registerRoutes(app);
	conversationRoute.registerRoutes(app);
	// add your routes here ,,,,
}
module.exports.register = register;