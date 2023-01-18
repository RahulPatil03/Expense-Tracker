import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Toolbar from '@mui/material/Toolbar';
import Head from 'next/head';
import { useRef } from 'react';

export default function Home() {
  const amountRef = useRef<HTMLInputElement>(null);

  return <>
    <Head>
      <title>Expense Tracker</title>
    </Head>
    <Toolbar sx={{ p: 1, justifyContent: 'center' }}>
      <TextField label="Amount" type='number' inputRef={amountRef} />
      <Button aria-label='Submit Button' onClick={async () => {
        const response = await fetch('api/item', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amountRef.current?.value })
        }).then(res => res.json());
        console.log(response);
      }}>Submit</Button>
    </Toolbar>
  </>
}
