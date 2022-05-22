import { Stack, StackProps } from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib'
import { Construct } from 'constructs';

// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import {Role, ServicePrincipal, PolicyStatement, Effect,} from 'aws-cdk-lib/aws-iam';
import * as apigw from 'aws-cdk-lib/aws-apigateway';
import * as ddb from 'aws-cdk-lib/aws-dynamodb';
import * as events from "aws-cdk-lib/aws-events";
import * as targets from "aws-cdk-lib/aws-events-targets";

export class BackendStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    cdk.aws_iam.Role
    const role = new Role(this, "LambdaRole", {
      assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
    });
    ///Attaching ses access to policy
    const policy = new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ["ses:SendEmail", "ses:SendRawEmail", "sns:*", "logs:*"],
      resources: ["*"],
    });
    //granting IAM permissions to role
    role.addToPolicy(policy);

    //  Creating send email lambda handler
    const lambdafn = new lambda.Function(this, "HandleReport", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "index.handler",
      role: role,
    });

    const consumerFn = new lambda.Function(this, "DynamoDB", {
      runtime: lambda.Runtime.NODEJS_16_X,
      code: lambda.Code.fromAsset("lambda"),
      handler: "consumer.handler",
      role: role,
    });

    const reportTable = new ddb.Table(this, 'CDKReportTable', {
      partitionKey: {
        name: 'id',
        type: ddb.AttributeType.STRING,
      },
    });
    reportTable.grantFullAccess(consumerFn)
    consumerFn.addEnvironment('REPORT_TABLE', reportTable.tableName);

    events.EventBus.grantAllPutEvents(lambdafn);

    // create the API Gateway with one method and path For lambda
    const api = new apigw.RestApi(this, "SendEmailEndPoint", {
      defaultCorsPreflightOptions: {
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS, // this is also the default
      },
    });
    api.root
      .resourceForPath("sendreport")
      .addMethod("POST", new apigw.LambdaIntegration(lambdafn));


     // The rule that filters events to match country == "PK" and sends them to the consumer Lambda.
     const PKrule = new events.Rule(this, "orderPKLambda", {
      targets: [new targets.LambdaFunction(consumerFn)],
      eventPattern: {
        region: ['us-east-2'],
      },
    });

    // logging api endpoint
    new cdk.CfnOutput(this, "Send email endpoint", {
      value: `${api.url}sendreport`,
    });


  }
}
