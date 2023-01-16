import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { signIn, signOut, useSession } from "next-auth/react";
import { useState } from 'react';

export default function Navbar() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const { data: session } = useSession();

    return <>
        <AppBar>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Expense Tracker
                </Typography>
                {session ? (
                    <IconButton onClick={e => setAnchorEl(e.currentTarget)} aria-label='Profile Options'>
                        <Avatar alt='Profile Image' src={session.user?.image || ''} />
                    </IconButton>
                ) : (
                    <Button onClick={() => signIn('google')} aria-label='Login Button'>Login</Button>
                )}
            </Toolbar>
        </AppBar>
        <Toolbar />
        <Menu open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
            <MenuItem onClick={() => console.log(session?.user)}>Profile</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <Divider />
            <MenuItem onClick={() => {
                setAnchorEl(null);
                signOut();
            }}>Sign Out</MenuItem>
        </Menu>
    </>
}