import { DynamoDBClient, PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const dynamoDBClient = new DynamoDBClient({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY || '',
        secretAccessKey: process.env.AWS_SECRET_KEY || ''
    },
    region: process.env.AWS_REGION
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    try {
        const session = await unstable_getServerSession(req, res, authOptions);
        if (!session) return res.status(401).json('Unauthorized');
        switch (req.method) {
            case 'POST':
                await dynamoDBClient.send(new PutItemCommand({
                    TableName: process.env.AWS_TABLE_NAME,
                    Item: {
                        date: { N: Date.now().toString() },
                        email: { S: session.user?.email || '' },
                        amount: { N: req.body.amount.toString() }
                    }
                }));
                return res.json('PutItem OK');
            case 'GET':
                const { Items } = await dynamoDBClient.send(new ScanCommand({
                    TableName: process.env.AWS_TABLE_NAME,
                    FilterExpression: 'email=:email',
                    ExpressionAttributeValues: {
                        ':email': { S: session.user?.email || '' },
                    },
                }));
                return res.json(Items?.map(({ date, email, amount }) => ({ date: date.N, email: email.S, amount: amount.N })));
        }
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal Server Error');
    }
}