/*
 this file define schema validator for data entry post calling.
 One route and service must have one schema file like this,,,,
 */
var schema = {
  properties: {
    message: {
      type: 'string',
      required: false,
      message: 'message property is required'
    },
    context: {
        type: 'string',
        required: false,
        message: 'message property is required'
    },
  }
}
module.exports.schema = schema;
