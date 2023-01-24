import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useSession } from 'next-auth/react';
import { createContext, useEffect, useReducer, useState } from 'react';

export default function Guest() {
    createContext(null);
    const { status } = useSession();
    const [openBackdrop, setOpenBackdrop] = useState(status === 'loading');

    useEffect(() => {
        setOpenBackdrop(status === 'loading');
    }, [status]);

    return <>
        {status === 'loading' || <Typography variant='h5' component='p' textAlign='center'>Login to manage your expenses here</Typography>}
        <Backdrop open={openBackdrop}>
            <CircularProgress />
        </Backdrop>
    </>
}
