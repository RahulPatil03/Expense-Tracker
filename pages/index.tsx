import { dynamoDBClient, s3Client } from '@/aws-clients';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useCallback, useRef } from 'react';

export default function Home() {
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement>(null);

  const onSubmit = useCallback(async () => {
    const fd = new FormData(formRef.current as HTMLFormElement);
    const amount = fd.get('amount') as string;
    const file = fd.get('file') as File;
    console.log(amount);
    console.log(file);
    await dynamoDBClient.send(new PutItemCommand({
      TableName: process.env.NEXT_PUBLIC_AWS_TABLE_NAME,
      Item: {
        date: { N: Date.now().toString() },
        email: { S: session?.user?.email as string },
        amount: { N: amount }
      }
    }));
    const putObjectCommandOutput = await s3Client.send(new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET,
      Key: file.name,
      Body: file
    }));
    console.log(putObjectCommandOutput);
  }, [session?.user?.email])

  return <>
    <Head>
      <title>Expense Tracker</title>
    </Head>
    <Toolbar sx={{ p: 1, justifyContent: 'center' }} component='form' ref={formRef}>
      <TextField label="Amount" type='number' name='amount' defaultValue={0} />
      <input type='file' name='file' />
      <Button aria-label='Submit Button' onClick={onSubmit}>Submit</Button>
    </Toolbar>
  </>
}
