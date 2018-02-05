var logger = require('../../../../lib/logger/logger').logger(__filename);
var schema = require('../../../schemas/mobile/sentiments');
var methods = require('../../../commons/methods');
var config = require('../../../../config/config');

var sentiment = require('sentiment');
var async = require('async');

var request = require('request');
var _gtUrl = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl=';

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

function translate(postObj, callback) {
    googleTranslator(postObj.message, postObj.language, 'in-GB', function (err, result) {
        if (err) callback(err);
        else callback(null, result);
    })
}


function googleTranslator(msg, from, to, callback) {

    logger.debug('text:' + msg + ' from:' + from + ' to:' + to);
    request(_gtUrl + to + '&dt=t&q=' + msg
        , function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log(body);
                var _arrayResponse = [];
                try {
                    var _arrayResponse = JSON.parse(body);
                    logger.debug(_arrayResponse[0][0][0]);
                    logger.debug(_arrayResponse[0][0][1]);
                } catch (err) {
                    _arrayResponse = err;
                }
                callback(null, _arrayResponse);
            }
        })
}

function detector(data,callback){
	console.log(data)
	var message = data[0][0][0];
	console.log(message)
	sentiment(message, function(err, result){
		if (err){
            callback(true, err);
		}else{
            callback(null,result);
		}

	})



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
			translate,
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

