import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';

export default function Navbar() {
    return (
        <AppBar position="sticky">
            <Toolbar>
                <Typography variant="h5" component="div" flexGrow={1}>
                    Expense Tracker
                </Typography>
            </Toolbar>
        </AppBar>
    );
}