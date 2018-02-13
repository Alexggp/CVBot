var logger = require('../../../../lib/logger/logger').logger(__filename);
var schema = require('../../../schemas/api/tone');
var methods = require('../../../commons/methods');
var config = require('../../../../config/config');
var toneDetectorService = require('../tone/service');
var translatorService = require('../translator/service');


var async = require('async');

var ConversationV1 = require('watson-developer-cloud/conversation/v1');
var conversation = new ConversationV1(config.conversation);



function getPostData(post, callback) {

	console.log(post)

	var postObj = {
		message: post.message,
		context: post.context
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

function translator(data,callback){
    if (data.message){
    	var obj = {
    		to: 'en',
			message:data.message
		}
        translatorService.translator(obj, function(error, resp){
            if (error){
                callback(true, error);
            }else{
            	var translated = resp.text;
                callback(null, data, translated);
            }

        })
    }else{
        callback(null, data, false);
    }
}

function toneDetector(data, translation, callback){
	if (translation){
		var obj = {
			message: translation
		}
        toneDetectorService.detector(obj, function(error, resp){
            if (error){
                callback(true, error);
			}else{
                callback(null, data, resp);
            }

        })
	}else{
        callback(null, data, {});
	}
}


function conversator(data, tone, callback){

	var message = data.message;
	var context = data.context;

    var dataSend={
        input: { text: message },
        workspace_id: config.conversationWorkspace
    }
    if (context) dataSend.context=  JSON.parse(context);

    conversation.message(
    	dataSend,
        function(err, response) {
            if (err){
                logger.error('conv error:', JSON.stringify(err));
                callback(true, err);
			}

            else{
            	logger.debug('conv response:' + JSON.stringify(response));
				callback(null, data, tone, response);
			}

        }
    );
}

function dbquery(data, tone, conversation, callback){

    var res = conversation.output.text[0].split("%");
    if (res.length > 1){
        console.log("HAY QUE MIRA REN BASE DE DATOOOOOSSSS: ", res[1])
    }

    callback(null,data, tone, conversation);
}


function adapter(data, tone, conversation, callback){
	logger.debug('adapter:'+data);
	var response = {
		tone: tone,
		conversation: conversation
	}

	callback(null,response);
}
function worker(post, callback) {
	var async = require('async');
	async.waterfall([
			async.apply(getPostData, post),
			checkSchema,
			translator,
			toneDetector,
			conversator,
			dbquery,
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

