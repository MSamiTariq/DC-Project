import { SES, EventBridge } from "aws-sdk";

import {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
} from "aws-lambda";

const ses = new SES();
// const sns = new SNS();

interface EmailParam {
  to?: string;
  from?: string;
  subject?: string;
  text?: string;
}
interface SmsParam {
  PhoneNumber?: string;
}

function helper(body: any) {
  const eventBridge = new EventBridge({ region: "us-east-2" });

  return eventBridge
    .putEvents({
      Entries: [
        {
          EventBusName: "default",
          Source: "custom.api",
          DetailType: "order",
          Detail: `{ "body": "${body}" }`,
        },
      ],
    })
    .promise();
}

exports.handler = async (
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> => {
  const { to, from, subject, text } = JSON.parse(
    event.body || "{}"
  ) as EmailParam;
  const { PhoneNumber } = JSON.parse(event.body || "{}") as SmsParam;

  const params = {
    Destination: {
      ToAddresses: [to || ""],
    },
    Message: {
      Body: {
        Text: { Data: text || "" },
      },
      Subject: { Data: subject || "" },
    },
    Source: from || "",
  };

  // var paramsSNS = {
  //   Message: text || "",
  //   PhoneNumber: PhoneNumber || "",
  // };

  console.log("event: ", event);

  // sns.publish(paramsSNS, function (err, data) {
  //   if (err) console.log(err, err.stack);
  //   // an error occurred
  //   else console.log(data); // successful response
  // });

  try {
    console.log(params);
    const e = await helper(params);
    await ses.sendEmail(params).promise();
    return Responses._200({ message: "The email has been sent" });
  } catch (error) {
    console.log("error sending email ", error);
    return Responses._400({ message: "The email failed to send" });
  }
};

const Responses = {
  _200(data: Object) {
    return {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 200,
      body: JSON.stringify(data),
    };
  },

  _400(data: Object) {
    return {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Methods": "*",
        "Access-Control-Allow-Origin": "*",
      },
      statusCode: 400,
      body: JSON.stringify(data),
    };
  },
};
