import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

export default function Layout({ children }: any) {
    const { data: session } = useSession();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    return <>
        <AppBar>
            <Toolbar>
                <Typography variant='h6' component='div' sx={{ flexGrow: 1 }}>
                    Expense Tracker
                </Typography>
                {session ? (
                    <IconButton onClick={e => setAnchorEl(e.currentTarget)} aria-label='Profile Options'>
                        <Avatar alt={session.user?.name || ''} src={session.user?.image || ''} />
                    </IconButton>
                ) : (
                    <Button variant='outlined' color='inherit' onClick={() => signIn('google')} aria-label='Login Button'>Login</Button>
                )}
            </Toolbar>
        </AppBar>
        <Menu open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
            <MenuItem onClick={() => console.log(session?.user)}>Profile</MenuItem>
            <MenuItem onClick={async () => {
                const response = await fetch('api/item').then(res => res.json());
                console.log(response);
            }}>Hit Item GET API</MenuItem>
            <MenuItem onClick={async () => {
                const response = await fetch('api/item', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: 1 })
                }).then(res => res.json());
                console.log(response);
            }}>Hit Item POST API</MenuItem>
            <MenuItem onClick={async () => {
                const response = await fetch('api/bucket', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ amount: 1 })
                }).then(res => res.json());
                console.log(response);
            }}>Hit Bucket POST API</MenuItem>
            <Divider />
            <MenuItem onClick={() => {
                setAnchorEl(null);
                signOut({ redirect: false });
            }}>Sign Out</MenuItem>
        </Menu>
        <Toolbar />
        {session && children}
    </>
}