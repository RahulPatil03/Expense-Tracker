import { dynamoDBClient, s3Client } from '@/aws-clients';
import { PutItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Link from '@mui/material/Link';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import { unstable_getServerSession } from 'next-auth';
import { useSession } from 'next-auth/react';
import Head from 'next/head';
import { useCallback, useRef, useState } from 'react';
import { authOptions } from './api/auth/[...nextauth]';

export async function getServerSideProps({ req, res }: any) {
  const session = await unstable_getServerSession(req, res, authOptions);
  const { Items }: any = await dynamoDBClient.send(new ScanCommand({
    TableName: process.env.NEXT_PUBLIC_AWS_TABLE_NAME,
    FilterExpression: 'email=:email',
    ExpressionAttributeValues: {
      ':email': { S: session?.user?.email as string },
    },
    ProjectionExpression: 'dateKey,amount,description,fileName',
  }));
  const data = [];
  for (const { dateKey, amount, description, fileName } of Items) {
    let file = '';
    if (fileName.S) file = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET,
      Key: `${session?.user?.email}/${fileName.S}`,
    }));
    data.push({ date: parseInt(dateKey.N), amount: parseInt(amount.N), description: description.S, file });
  }
  return { props: { data } };
}

export default function Home({ data }: any) {
  const { data: session } = useSession();
  const formRef = useRef<HTMLFormElement>(null);
  const [items, setItems] = useState(data);

  console.log({ data });

  const onSubmit = useCallback(async (event: any) => {
    try {
      event.preventDefault();
      const fd = new FormData(formRef.current as HTMLFormElement);

      const amount = fd.get('amount') as string;
      const description = fd.get('description') as string;
      const file = fd.get('file') as File;

      const dateKey = Date.now();

      await dynamoDBClient.send(new PutItemCommand({
        TableName: process.env.NEXT_PUBLIC_AWS_TABLE_NAME,
        Item: {
          dateKey: { N: dateKey.toString() },
          email: { S: session?.user?.email as string },
          amount: { N: amount },
          description: { S: description },
          fileName: { S: file.name }
        }
      }));

      if (Boolean(file.size)) await s3Client.send(new PutObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET,
        Key: `${session?.user?.email}/${file.name}`,
        Body: file
      }));

      setItems([...items, { date: dateKey, amount: parseInt(amount), description, file: URL.createObjectURL(file) }]);

      alert("Expense Added Successfully");
    } catch (error) {
      console.error(error);
      alert(error);
    }
  }, [items, session?.user?.email])

  return <>
    <Head>
      <title>Expense Tracker</title>
    </Head>
    <Toolbar sx={{ p: 2, justifyContent: 'center', gap: 2, flexWrap: 'wrap' }} component='form' ref={formRef} onSubmit={onSubmit}>
      <TextField label="Amount" type='number' name='amount' required
        inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 1 }}
        InputProps={{ startAdornment: <InputAdornment position='start'>&#8377;</InputAdornment> }} />
      <TextField name='description' label='Description' required />
      <TextField type='file' name='file' label='Upload Image' InputLabelProps={{ shrink: true }} />
      <Button aria-label='Submit Button' type='submit' variant='outlined'>Submit</Button>
    </Toolbar>
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
