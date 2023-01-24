import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { signIn, useSession } from 'next-auth/react';
import Image from 'next/image';
import { useState } from 'react';

export default function Navbar() {
    const { data: session } = useSession();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    return <>
        <AppBar>
            <Toolbar>
                <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>Expense Tracker</Typography>
                {session ? (
                    <IconButton onClick={e => setAnchorEl(e.currentTarget)} aria-label='Profile Options'>
                        <Avatar>
                            <Image alt={session.user?.name as string} src={session.user?.image as string} fill sizes='50vw' priority />
                        </Avatar>
                    </IconButton>
                ) : (
                    <Button variant='outlined' color='inherit' onClick={() => signIn('google')} aria-label='Login Button'>Login</Button>
                )}
            </Toolbar>
        </AppBar>
        <Toolbar />
    </>
}