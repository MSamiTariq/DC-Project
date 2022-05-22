import { Stack, StackProps, } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront'
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment'
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins'
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class DeployementStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

     // The code that defines your stack goes here
    //Deploy Gatsby on s3 bucket
    const myBucket = new s3.Bucket(this, "DCProject", {
      versioned: true,
      websiteIndexDocument: "index.html",
      publicReadAccess: true,
    });

    const dist = new cloudfront.Distribution(this, "myDistribution-DC", {
      defaultBehavior: { origin: new origins.S3Origin(myBucket) },
    });

    new s3Deployment.BucketDeployment(this, "deployStaticWebsite", {
      sources: [s3Deployment.Source.asset("../frontend/FE/public")],
      destinationBucket: myBucket,
      distribution: dist,
    });
  }
}
