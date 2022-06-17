import { useNavigate } from 'react-router-dom';
import { Grid, Container, Button, TextField } from '@mui/material';
import '../CSS/rankingButton.css';
import '../CSS/rainbow.css';
import '../CSS/neon.css';
import '../CSS/neon-flicker.css';
import '../CSS/neon-shadow.css';
import '../CSS/fancyButton.css';
// import '../CSS/titleNeon.css';
import { FormEvent, useCallback, useContext, useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import axios from 'axios';
import { UserContext } from '../Contexts/userContext';
import User from '../Interfaces/user.interface';

// This page is located on localhost:3000/

type Props = {};

const LandingPage = (props: Props) => {
  let navigate = useNavigate();
  const [not42, setNot42] = useState<boolean>(false);
  const [createUser, setCreateUser] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const [username, setUsername] = useState<string>('');
  const [showWrongPassword, setShowWrongPassword] = useState<boolean>(false);
  const [showUserDoesNotExist, setShowUserDoesNotExist] = useState<boolean>(false);
  const [showUserAlreadyExist, setShowUserAlreadyExist] = useState<boolean>(false);
  const userContext = useContext(UserContext);

  const [userList, setUserList] = useState<User[]>([]);

  const updateUserList = useCallback(() => {
    axios
      .get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/users`, { withCredentials: false })
      .then((res) => setUserList(res.data))
      .catch((err) => console.log(err));
  }, []);

  function checkUserExists() {
    if (userList.find((user: User) => user.username === username) !== undefined) return true;
    return false;
  }

  useEffect(() => {
    updateUserList();
  }, []);

  function joinPong() {
    navigate('/login');
  }

  // NOT 42 LOGIN - CREATE USER ///////////////////////////////////////////////////////
  const createNewUser = () => {
    if (!password.length || !username.length) return;
    if (checkUserExists()) setShowUserAlreadyExist(true);
    else {
      axios
        .post(`${process.env.REACT_APP_DEFAULT_URL}/users`, { username: username, password: password }, { withCredentials: false })
        .then((res) => logIn(res.data))
        .catch((err) => console.log(err));
    }
  };

  // NOT 42 LOGIN - PASSWORD HANDLING ///////////////////////////////////////////////

  function logIn(data: User) {
    axios
      .post(`${process.env.REACT_APP_DEFAULT_URL}/auth/fakelogin`, data, { withCredentials: true })
      .then((res) => {
        userContext.setUser(res.data);
        if (res.data.isTwoFactorAuthenticationEnabled) navigate('/2fwa');
        else navigate('/game');
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        }
      });
  }

  function verifyPassword() {
    if (!password.length || !username.length) return;
    if (!checkUserExists()) setShowUserDoesNotExist(true);
    else {
      axios
        .post(`${process.env.REACT_APP_DEFAULT_URL}/users/${username}/check_password`, { password: password }, { withCredentials: false })
        .then((res) => {
          if (res.data) logIn(res.data);
          else setShowWrongPassword(true);
        })
        .catch((err) => console.log(err));
      setPassword('');
    }
  }

  //////////////// HANDLE TYPING //////////////////////////////////////////////
  function handleTypingUsername(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setUsername(e.currentTarget.value);
  }

  function handleTypingPassword(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setPassword(e.currentTarget.value);
  }

  /////////////// SNACKBAR <WRONG PASSWORD> ///////////////////////////////////
  const handleClosePassword = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowWrongPassword(false);
  };

  const DisplaySnackbarWrongPassword = () => {
    return (
      <Snackbar open={showWrongPassword} autoHideDuration={6000} onClose={handleClosePassword}>
        <Alert onClose={handleClosePassword} severity="error" sx={{ width: '100%' }}>
          {'Wrong password...'}
        </Alert>
      </Snackbar>
    );
  };

  /////////////// SNACKBAR <USER DOES NOT EXIST> ///////////////////////////////////
  const handleCloseUserDoesNotExist = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowUserDoesNotExist(false);
  };

  const DisplaySnackbarUserDoesNotExist = () => {
    return (
      <Snackbar open={showUserDoesNotExist} autoHideDuration={6000} onClose={handleCloseUserDoesNotExist}>
        <Alert onClose={handleCloseUserDoesNotExist} severity="error" sx={{ width: '100%' }}>
          {'This user does not exist.'}
        </Alert>
      </Snackbar>
    );
  };

  /////////////// SNACKBAR <USER ALREADY EXIST> ///////////////////////////////////
  const handleCloseUserAlreadyExist = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowUserAlreadyExist(false);
  };

  const DisplaySnackbarUserAlreadyExist = () => {
    return (
      <Snackbar open={showUserAlreadyExist} autoHideDuration={6000} onClose={handleCloseUserAlreadyExist}>
        <Alert onClose={handleCloseUserAlreadyExist} severity="error" sx={{ width: '100%' }}>
          {'This username is already taken.'}
        </Alert>
      </Snackbar>
    );
  };

  ////////////// ON ENTER KEY PRESS /////////////////////////
  function submitLogin(e: any) {
    createUser ? createNewUser() : verifyPassword();
  }

  return (
    <Container sx={{ backgroundColor: 'rgb(35,35,35)', height: '100vh' }}>
      <Grid container alignItems="center" direction="column" justifyContent="center" sx={{ paddingTop: '50px' }}>
        <Grid item>
          <h1 className="neon-shadow">
            nu<span className="delay1">m</span>a num<span className="delay2">a</span> p<span className="delay3">o</span>ng
          </h1>
        </Grid>
        <Grid item>
          <h2 className="classic" style={{ fontSize: '1.5em' }}>
            This website was designed as part of a 42 project: ft_transcendance.
          </h2>
        </Grid>
      </Grid>
      <Grid container alignItems="center" direction="row" spacing={20} justifyContent="center" sx={{ paddingTop: '150px' }}>
        <Grid item xs={12}>
          <p className="classic" style={{ fontSize: '1.5em' }}>
            You need to log in
            <br /> or sign up before entering the website.
          </p>
        </Grid>
        <Grid item>
          {!not42 ? (
            <Button onClick={joinPong} className="neon-flicker delay2" variant="outlined">
              I'm from 42
            </Button>
          ) : (
            ''
          )}
        </Grid>
        <Grid item>
          <Button onClick={() => setNot42(!not42)} className={not42 ? 'neon-shadow delay1' : 'neon-flicker delay1'} variant="outlined">
            {not42 ? 'Back' : "I'm not from 42"}
          </Button>
        </Grid>
        {not42 ? (
          <div>
            <Grid container alignItems="center" direction="row" spacing={4} justifyContent="center">
              <Grid item>
                <TextField
                  className="neon-flicker"
                  value={username}
                  onChange={handleTypingUsername}
                  id="outlined-basic"
                  label="Login"
                  variant="outlined"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') submitLogin(e);
                  }}
                />
              </Grid>
              <Grid item>
                <TextField
                  className="neon-flicker"
                  type="password"
                  value={password}
                  onChange={handleTypingPassword}
                  id="outlined-basic"
                  label="Password"
                  variant="outlined"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') submitLogin(e);
                  }}
                />
              </Grid>
              <Grid item>
                {createUser ? (
                  <Button className="neon-flicker" type="submit" onClick={createNewUser}>
                    Sign up
                  </Button>
                ) : (
                  <Button className="neon-flicker" type="submit" onClick={verifyPassword}>
                    Log in
                  </Button>
                )}
              </Grid>
              <Grid item>
                <Button sx={{ backgroundColor: 'rgba(10, 141, 202, 0.856);', color: 'white' }} variant="outlined" className="neon-flicker" onClick={() => setCreateUser(!createUser)}>
                  {createUser ? 'I already have a profile' : 'First time?'}
                </Button>
              </Grid>
            </Grid>
          </div>
        ) : (
          ''
        )}
      </Grid>
      <DisplaySnackbarWrongPassword />
      <DisplaySnackbarUserDoesNotExist />
      <DisplaySnackbarUserAlreadyExist />
    </Container>
  );
};

export default LandingPage;
