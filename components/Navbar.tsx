import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

export default function Navbar() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [session, setSession] = useState(false); //will be removed

    return <>
        <AppBar>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    Expense Tracker
                </Typography>
                {session ? (
                    <IconButton onClick={e => setAnchorEl(e.currentTarget)}>
                        <Avatar alt="Remy Sharp" src="/static/images/avatar/2.jpg" />
                    </IconButton>
                ) : (
                    <Button onClick={() => setSession(true)}>Login</Button>
                )}
            </Toolbar>
        </AppBar>
        <Toolbar />
        <Menu open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
            <MenuItem>Menu Item 1</MenuItem>
            <MenuItem>Menu Item 2</MenuItem>
            <Divider />
            <MenuItem onClick={() => {
                setAnchorEl(null);
                setSession(false);
            }}>Sign Out</MenuItem>
        </Menu>
    </>
}