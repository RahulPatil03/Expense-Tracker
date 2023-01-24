import { dynamoDBClient, s3Client } from '@/aws-clients';
import Form from '@/components/Form';
import { ScanCommand } from '@aws-sdk/client-dynamodb';
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { unstable_getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useCallback, useState } from 'react';
import { authOptions } from './api/auth/[...nextauth]';

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
  const router = useRouter();

  const openFile = useCallback(async (file: string) => {
    const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET,
      Key: `${session?.user?.email}/${file}`,
    }));
    router.push(signedUrl);
  }, [router, session?.user?.email]);

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
          <TableCell align='center'>Description</TableCell>
          <TableCell align='center'>File</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map(({ date, amount, description, file }: any) => (
          <TableRow key={date}>
            <TableCell>{new Date(date).toLocaleString()}</TableCell>
            <TableCell>&#8377; {amount}</TableCell>
            <TableCell align='center'>{description}</TableCell>
            <TableCell>{file && <Button onClick={() => openFile(file)}>Open File</Button>}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </>
}
