import { dynamoDBClient, s3Client } from '@/aws-clients';
import ExpenseTable from '@/components/ExpenseTable';
import Form from '@/components/Form';
import { DeleteItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { unstable_getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { authOptions } from './api/auth/[...nextauth]';
import { useAppContext } from './_app';

export async function getServerSideProps({ req, res }: any) {
  const session = await unstable_getServerSession(req, res, authOptions);
  let data = [];
  if (session) {
    const { Items }: any = await dynamoDBClient.send(new ScanCommand({
      TableName: process.env.NEXT_PUBLIC_AWS_TABLE_NAME,
      FilterExpression: 'email=:email',
      ExpressionAttributeValues: {
        ':email': { S: session?.user?.email as string },
      }
    }));
    data = Items.map(({ date, amount, description, file }: any) => ({
      date: parseInt(date.N),
      amount: amount.N,
      description: description.S,
      file: file.S
    }));
  }
  return { props: { data } };
}

export default function Home({ data }: any) {
  const { data: session } = useSession();
  const [items, setItems] = useState(data);
  const [_, dispatch] = useAppContext();
  const router = useRouter();

  const openFile = useCallback(async (file: string) => {
    dispatch({ type: 'toggleBackdrop', open: true });
    const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET,
      Key: `${session?.user?.email}/${file}`,
    }));
    router.push(signedUrl);
    dispatch({ type: 'toggleBackdrop', open: false });
  }, [dispatch, router, session?.user?.email]);

  const deleteRecord = useCallback(async (date: number, file: string) => {
    dispatch({ type: 'toggleBackdrop', open: true });
    await dynamoDBClient.send(new DeleteItemCommand({
      TableName: process.env.NEXT_PUBLIC_AWS_TABLE_NAME,
      Key: {
        date: { N: date.toString() },
      },
    }));
    if (file) await s3Client.send(new DeleteObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET,
      Key: `${session?.user?.email}/${file}`
    }));
    setItems(items.filter((item: any) => item.date !== date));
    dispatch({ type: 'deleteRecord', message: 'Record Deleted Successfully' });
  }, [dispatch, items, session?.user?.email]);

  return <>
    <Head>
      <title>Expense Tracker</title>
    </Head>
    <Form items={items} setItems={setItems} />
    <ExpenseTable items={items} openFile={openFile} deleteRecord={deleteRecord} />
  </>
}
