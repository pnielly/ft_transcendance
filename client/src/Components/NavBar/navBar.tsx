import React, { useState, useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import AdbIcon from '@mui/icons-material/Adb';
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../../Contexts/userContext';
import { Outlet } from 'react-router-dom';
import UserMenu from './userMenu';
import NavMenu from './navMenu';
import ChatInvites from './chatInvites';
import GameInvites from './gameInvites';
import FriendInvites from './friendInvites';
import axios from 'axios';
import { Grid } from '@mui/material';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import '../../CSS/neon-flicker.css'

const ResponsiveAppBar = () => {
  const me = useContext(UserContext).user;
  let navigate = useNavigate();
  const [showLogout, setShowLogout] = useState<boolean>(false);

  const menuClicked = (event: React.MouseEvent<HTMLLIElement, MouseEvent>, setting: string) => {
    event.preventDefault();
    if (setting === 'Settings') {
      navigate(`/settings/${me.id}`);
    }
    if (setting === 'Profile') {
      navigate('/users', { state: me });
    }
    if (setting === 'Logout') {
      axios
        .get(`${process.env.REACT_APP_DEFAULT_URL}/auth/logout`, { withCredentials: true })
        .then((res) => {
          setShowLogout(true);
          navigate('/home');
        })
        .catch((err) => console.log(err));
    }
  };

  //////////////////////////////// SNACKBAR <YOU ARE LOGGED OUT> //////////////////////
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowLogout(false);
  };

  return (
    <React.Fragment>
      <AppBar position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            {/* <AdbIcon sx={{ display: { xs: 'none', md: 'flex' }, mr: 1 }} /> */}
            <Typography
              variant="h6"
              noWrap
              component="a"
              href="/game"
              sx={{
                mr: 2,
                display: { xs: 'none', md: 'flex' },
                fontFamily: 'monospace',
                fontWeight: 600,
                letterSpacing: '.3rem',
                color: 'inherit',
                textDecoration: 'none',
                minWidth: 310,
              }}
              className="neon-flicker"
            >
              FT_TRANSCENDANCE
            </Typography>
            <NavMenu />
            <Grid container justifyContent="flex-end" alignItems="center" spacing={2}>
              <Grid item>
              <ChatInvites />
              </Grid>
              <Grid item>
              <GameInvites />
              </Grid>
              <Grid item>
              <FriendInvites />
              </Grid>
            
            <Grid item>
            <UserMenu menuClicked={menuClicked} />
            </Grid>
            </Grid>
          </Toolbar>
        </Container>
      </AppBar>
      <div>
        <Outlet />
      </div>
      <Snackbar open={showLogout} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          You have been successfully logged out.
        </Alert>
      </Snackbar>
    </React.Fragment>
  );
};
export default ResponsiveAppBar;
