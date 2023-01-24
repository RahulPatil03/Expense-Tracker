import { dynamoDBClient, s3Client } from '@/aws-clients';
import Form from '@/components/Form';
import { DeleteItemCommand, ScanCommand } from '@aws-sdk/client-dynamodb';
import { DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
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
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [openBackdrop, setOpenBackdrop] = useState(false);
  const router = useRouter();

  const openFile = useCallback(async (file: string) => {
    const signedUrl = await getSignedUrl(s3Client, new GetObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET,
      Key: `${session?.user?.email}/${file}`,
    }));
    router.push(signedUrl);
  }, [router, session?.user?.email]);

  const deleteRecord = useCallback(async (date: number, file: string) => {
    setOpenBackdrop(true);
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
    setOpenBackdrop(false);
  }, [items, session?.user?.email]);

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
          <TableCell align='center'>Action</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {items.map(({ date, amount, description, file }: any) => (
          <TableRow key={date}>
            <TableCell align='center'>{new Date(date).toLocaleString()}</TableCell>
            <TableCell>&#8377; {amount}</TableCell>
            <TableCell align='center'>{description}</TableCell>
            <TableCell align='center'>{file && <Button onClick={() => openFile(file)}>Open File</Button>}</TableCell>
            <TableCell align='center'><Button onClick={() => deleteRecord(date, file)}>Delete Record</Button></TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
    <Snackbar
      open={openSnackbar}
      autoHideDuration={2000}
      onClose={() => setOpenSnackbar(false)}
      message="Expense Added Successfully"
      ContentProps={{ sx: { justifyContent: 'center' } }}
    />
    <Backdrop open={openBackdrop}>
      <CircularProgress />
    </Backdrop>
  </>
}
