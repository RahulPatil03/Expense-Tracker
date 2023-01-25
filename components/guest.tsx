import Typography from '@mui/material/Typography';
import Head from 'next/head';

export default function Guest() {
    return <>
        <Head>
            <title>Not Logged In</title>
        </Head>
        <Typography variant='h5' component='p' textAlign='center'>Login to manage your expenses here</Typography>
    </>;
}
