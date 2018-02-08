var logger = require('../../../../lib/logger/logger').logger(__filename);
var schema = require('../../../schemas/api/tone');
var methods = require('../../../commons/methods');
var config = require('../../../../config/config');


var async = require('async');

var ConversationV1 = require('watson-developer-cloud/conversation/v1');

var conversation = new ConversationV1(config.conversation);



function getPostData(post, callback) {
	
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

function conversator(data,callback){

	var message = data.message;
	var context = data.context

    conversation.message(
        {
            input: { text: message },
			context:  JSON.parse(data.context),
            workspace_id: config.conversationWorkspace
        },
        function(err, response) {
            if (err){
                logger.error('conv error:', JSON.stringify(err));
                callback(true, err);
			}

            else{
            	logger.debug('conv response:' + JSON.stringify(response));
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
			conversator,
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

