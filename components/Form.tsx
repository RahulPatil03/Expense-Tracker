import { dynamoDBClient, s3Client } from '@/aws-clients';
import { PutItemCommand } from '@aws-sdk/client-dynamodb';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import { useSession } from 'next-auth/react';
import { useCallback, useRef } from 'react';

export default function Form({ items, setItems }: any) {
    const { data: session } = useSession();
    const formRef = useRef<HTMLFormElement>(null);

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

            if (file.size) await s3Client.send(new PutObjectCommand({
                Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET,
                Key: `${session?.user?.email}/${file.name}`,
                Body: file
            }));

            setItems([...items, { date: dateKey, amount: parseInt(amount), description, ...(file.size && { file: URL.createObjectURL(file) }) }]);

            alert("Expense Added Successfully");
        } catch (error) {
            console.error(error);
            alert(error);
        }
    }, [items, session?.user?.email, setItems])

    return (
        <Toolbar sx={{ p: 2, justifyContent: 'center', gap: 2, flexWrap: 'wrap' }} component='form' ref={formRef} onSubmit={onSubmit}>
            <TextField label="Amount" type='number' name='amount' required
                inputProps={{ inputMode: 'numeric', pattern: '[0-9]*', min: 1 }}
                InputProps={{ startAdornment: <InputAdornment position='start'>&#8377;</InputAdornment> }} />
            <TextField name='description' label='Description' required />
            <TextField type='file' name='file' label='Upload Image' InputLabelProps={{ shrink: true }} />
            <Button aria-label='Submit Button' type='submit' variant='outlined'>Submit</Button>
        </Toolbar>
    )
}