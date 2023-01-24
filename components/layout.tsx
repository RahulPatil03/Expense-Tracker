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
import Image from 'next/image';
import { useCallback, useState } from 'react';
import Guest from './Guest';

export default function Layout({ children }: any) {
  const { data: session } = useSession();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const onSignOut = useCallback(() => {
    if (confirm('Do you really want to Sign Out?')) {
      setAnchorEl(null);
      signOut({ redirect: false });
    }
  }, []);

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
    <Menu open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)} anchorEl={anchorEl}>
      <MenuItem onClick={() => console.log(session?.user)}>Profile</MenuItem>
      <Divider />
      <MenuItem onClick={onSignOut}>Sign Out</MenuItem>
    </Menu>
    <Toolbar />
    {session ? children : <Guest />}
  </>
}