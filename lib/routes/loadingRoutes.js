/* list of all routes */
var translatorRoute = require('./mobile/translator');
var pingRoute = require('./mobile/ping');
var sentimentsRoute = require('./mobile/sentiments');
function register(app)
{
	translatorRoute.registerRoutes(app);
	pingRoute.registerRoutes(app);
	sentimentsRoute.registerRoutes(app);
	// add your routes here ,,,,
}
module.exports.register = register;