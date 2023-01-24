import { dynamoDBClient, s3Client } from '@/aws-clients';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import InputAdornment from '@mui/material/InputAdornment';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import { useSession } from 'next-auth/react';
import { SyntheticEvent, useCallback, useRef, useState } from 'react';

export default function Form({ items, setItems }: any) {
	const { data: session } = useSession();
	const formRef = useRef<HTMLFormElement>(null);
	const [openSnackbar, setOpenSnackbar] = useState(false);
	const [openBackdrop, setOpenBackdrop] = useState(false);

	const onSubmit = useCallback(async (event: SyntheticEvent) => {
		event.preventDefault();
		setOpenBackdrop(true);
		const fd = new FormData(formRef.current as HTMLFormElement);

		const amount = fd.get('amount') as string;
		const description = fd.get('description') as string;
		const file = fd.get('file') as File;

		const date = Date.now();

		await dynamoDBClient.send(new PutItemCommand({
			TableName: process.env.NEXT_PUBLIC_AWS_TABLE_NAME,
			Item: {
				date: { N: date.toString() },
				email: { S: session?.user?.email as string },
				amount: { N: amount },
				description: { S: description },
				file: { S: file.name }
			}
		}));

		if (file.size) await s3Client.send(new PutObjectCommand({
			Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET,
			Key: `${session?.user?.email}/${file.name}`,
			Body: file
		}));

		setItems([...items, { date, amount: parseInt(amount), description, file: file.name }]);
		setOpenBackdrop(false);
		setOpenSnackbar(true);
	}, [items, session?.user?.email, setItems])

	return <>
		<Toolbar sx={{ p: 2, justifyContent: 'center', gap: 2, flexWrap: 'wrap' }} component='form' ref={formRef} onSubmit={onSubmit}>
			<TextField label='Amount' type='number' name='amount' required
				inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 1 }}
				InputProps={{ startAdornment: <InputAdornment position='start'>&#8377;</InputAdornment> }} />
			<TextField name='description' label='Description' required />
			<TextField type='file' name='file' label='Upload Image' InputLabelProps={{ shrink: true }} />
			<Button aria-label='Submit Button' type='submit' variant='outlined'>Add Expense</Button>
		</Toolbar>
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