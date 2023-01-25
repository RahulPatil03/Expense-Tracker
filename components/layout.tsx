import { useAppContext } from '@/pages/_app';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Backdrop from '@mui/material/Backdrop';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import Guest from './Guest';

export default function Layout({ children }: any) {
    const { data: session, status } = useSession();
    const [{ snackbarOpen, snackbarMessage, backdropOpen }, dispatch] = useAppContext();
    const [anchorEl, setAnchorEl] = useState<any>(null);

    useEffect(() => {
        if (status !== 'loading') dispatch({ type: 'toggleBackdrop', open: false });
    }, [dispatch, status]);

    const onSignOut = useCallback(() => {
        if (confirm('Do you really want to Sign Out?')) {
            dispatch({ type: 'toggleBackdrop', open: true });
            setAnchorEl(null);
            signOut({ redirect: false });
            dispatch({ type: 'toggleBackdrop', open: false });
        }
    }, [dispatch]);

    return <>
        
        <AppBar>
            <Toolbar>
                <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>Expense Tracker</Typography>
                {status !== 'loading' && (session ? (
                    <IconButton onClick={e => setAnchorEl(e.currentTarget)} aria-label='Profile Options'>
                        <Avatar>
                            <Image alt={session.user?.name as string} src={session.user?.image as string} fill sizes='50vw' priority />
                        </Avatar>
                    </IconButton>
                ) : (
                    <Button variant='outlined' color='inherit' onClick={() => signIn('google')} aria-label='Login Button'>Login</Button>
                ))}
            </Toolbar>
        </AppBar>
        <Toolbar />
        <Menu open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
            <MenuItem onClick={() => alert(JSON.stringify(session?.user))}>Profile</MenuItem>
            <Divider />
            <MenuItem onClick={onSignOut}>Sign Out</MenuItem>
        </Menu>
        <Snackbar
            open={snackbarOpen}
            autoHideDuration={2000}
            onClose={() => dispatch({ type: 'closeSnackbar' })}
            message={snackbarMessage}
            ContentProps={{ sx: { justifyContent: 'center' } }}
        />
        <Backdrop open={backdropOpen} sx={{ zIndex: theme => theme.zIndex.appBar }}>
            <CircularProgress />
        </Backdrop>
        {status !== 'loading' && (session ? children : <Guest />)}
    </>
}