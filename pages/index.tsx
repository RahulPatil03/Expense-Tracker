import { dynamoDBClient, s3Client } from '@/aws-clients';
import Form from '@/components/Form';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { unstable_getServerSession } from 'next-auth';
import Head from 'next/head';
import { useState } from 'react';
import { authOptions } from './api/auth/[...nextauth]';

export async function getServerSideProps({ req, res }: any) {
  const session = await unstable_getServerSession(req, res, authOptions);
  const data = [];
  if (session) {
    const { Items }: any = await dynamoDBClient.send(new ScanCommand({
      TableName: process.env.NEXT_PUBLIC_AWS_TABLE_NAME,
      FilterExpression: 'email=:email',
      ExpressionAttributeValues: {
        ':email': { S: session?.user?.email as string },
      },
      ProjectionExpression: 'dateKey,amount,description,fileName',
    }));
    for (const { dateKey, amount, description, fileName } of Items) {
      let file = '';
      if (fileName.S) file = await getSignedUrl(s3Client, new GetObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET,
        Key: `${session?.user?.email}/${fileName.S}`,
      }));
      data.push({ date: parseInt(dateKey.N), amount: parseInt(amount.N), description: description.S, file });
    }
  }
  return { props: { data } };
}

export default function Home({ data }: any) {

  const [items, setItems] = useState(data);

  console.log({ data });

  return <>
    <Head>
      <title>Expense Tracker</title>
    </Head>
    <Form items={items} setItems={setItems} />
    <Table sx={{ mx: 'auto', width: 'auto' }}>
      <TableHead>
        <TableRow>
          <TableCell align='center'>Date</TableCell>
          <TableCell>Amount</TableCell>
          <TableCell>Description</TableCell>
          <TableCell>File</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map(({ date, amount, description, file }: any) => (
          <TableRow key={date}>
            <TableCell>{new Date(date).toLocaleString()}</TableCell>
            <TableCell>&#8377; {amount}</TableCell>
            <TableCell align='center'>{description}</TableCell>
            <TableCell>{file && <Link href={file} target='_blank'>Open File</Link>}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </>
}
