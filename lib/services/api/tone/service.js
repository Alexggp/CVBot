var logger = require('../../../../lib/logger/logger').logger(__filename);
var schema = require('../../../schemas/api/tone');
var methods = require('../../../commons/methods');
var config = require('../../../../config/config');


var async = require('async');
const translate = require('google-translate-api');

var ToneAnalyzerV3 = require('watson-developer-cloud/tone-analyzer/v3');

var tone_analyzer = new ToneAnalyzerV3(config.toneAnalyzer);



function getPostData(post, callback) {
	
	var postObj = {
		message: post.message,
		language: post.language
	}
	callback(null, postObj);
}


function checkSchema(postObj, callback) {
	methods.validateRegister(postObj, schema, function (err, result) {
		logger.debug('in:' + JSON.stringify(result));
		if (!err.valid) {
			logger.error(JSON.stringify(err));
			callback(true, err);
		}
		else {
			return callback(null, postObj);
		}
	});
}

function translator(data, callback) {

    translate(data.message, {from: data.language, to: 'en'}).then(res => {
        callback(null, res.text);
		}).catch(err => {
				console.error(err);
			callback(true, err);
		});
}

function detector(data,callback){
	console.log(data)
	var message = data.message;
	console.log(message)

    var params = {
        'tone_input': {
        	"text": message
		},
        'content_type': 'application/json'
    };

	console.log(params)

    tone_analyzer.tone(params, function(error, response) {
            if (error){
                logger.error('tone error:', JSON.stringify(error));
                callback(true, error);
			}

            else{
            	logger.debug('tone response:' + JSON.stringify(response, null, 2));
				callback(null, response);
			}

        }
    );
}

function adapter(data,callback){
	logger.debug('adapter:'+data);
	callback(null,data);
}
function worker(post, callback) {
	var async = require('async');
	async.waterfall([
			async.apply(getPostData, post),
			checkSchema,
			//translator,
			detector,
			adapter
		],
		function (err, result) {
			if (err) callback(result)
			else callback(err, result);
		}
	);
}

function entry(post, callback) {
	async.parallelLimit([async.apply(worker, post)], config.rest.max_callers, function (err, result) {
		if (err) logger.error('out:' + JSON.stringify(err));
		else logger.debug('out:' + JSON.stringify(result[0]));
		callback(err, result[0]);
	});
}

module.exports.entry = entry;
module.exports.detector = detector;

