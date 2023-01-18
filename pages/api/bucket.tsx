import { GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { NextApiRequest, NextApiResponse } from 'next';
import { unstable_getServerSession } from 'next-auth';
import { authOptions } from './auth/[...nextauth]';

const s3Client = new S3Client({
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
                const putObjectCommandOutput = await s3Client.send(new PutObjectCommand({
                    Bucket: process.env.AWS_BUCKET,
                    Key: 'test.txt',
                    Body: 'test body'
                }));
                return res.json(putObjectCommandOutput);
            case 'GET':
                const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand({
                    Bucket: process.env.AWS_BUCKET,
                    Key: 'test.txt',
                }), { expiresIn: 600 });
                return res.json(signedUrl);
        }
    } catch (error) {
        console.error(error);
        res.status(500).json('Internal Server Error');
    }
}
