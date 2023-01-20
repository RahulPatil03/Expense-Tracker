import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { S3Client } from "@aws-sdk/client-s3";

const config = {
    credentials: {
        accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY as string,
        secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_KEY as string
    },
    region: process.env.NEXT_PUBLIC_AWS_REGION
}

export const s3Client = new S3Client(config);

export const dynamoDBClient = new DynamoDBClient(config);