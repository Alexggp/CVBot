/*
 This is an example of service.
 this service translate a post message parameter using google translator a message from  (language) to (language)
 using ISO639-1 codes
 google translator facility.
 */
var logger = require('../../../../lib/logger/logger').logger(__filename);
var schema = require('../../../schemas/mobile/rosetta');
var methods = require('../../../commons/methods');
var config = require('../../../../config/config');

var async = require('async');

const translate = require('google-translate-api');



function getPostData(post, callback) {
	
	var postObj = {
		from: post.from,
		to: post.to,
		message: post.message
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
			callback(null, result);
		}
	});
}

function translator(data, callback) {

    translate(data.message, {from: data.from, to: data.to}).then(res => {
        //console.log(res.text);
		//=> Ik spreek Nederlands!
		//console.log(res.from.text.autoCorrected);
		//=> true
		//console.log(res.from.text.value);
		//=> I [speak] Dutch!
		//console.log(res.from.text.didYouMean);
		//=> false
    	callback(null, res);
	}).catch(err => {
			console.error(err);
    	callback(true, err);
	});
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
			translator,
			adapter
		],
		function (err, result) {
			if (err) callback(result)
			else callback(err, {source: post.message, target: result});
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

