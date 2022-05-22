const aws = require('aws-sdk');
var crypto = require("crypto");
const docClient = new aws.DynamoDB.DocumentClient();

exports.handler = async (event: any) => {
    var id = crypto.randomBytes(20).toString('hex');
    // var evnt = JSON.parse(event.detail.body)
    // evnt.id = id;
    // console.log("The event: ", evnt);
    var obj = {
        id: id,
        email: 'samitariq40@gmail.com',
        phoneNumber: '+923323327425',
        subject: 'lab report',
        report: 'some text'
    }


    const params = {
        TableName: process.env.REPORT_TABLE,
        Item: obj
    }
    try {
        await docClient.put(params).promise();
        return event;
    } catch (err) {
        console.log('DynamoDB error: ', err);
        return null;
    }

}