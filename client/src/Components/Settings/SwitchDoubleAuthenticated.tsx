import { Button, Grid, Switch, TextField } from '@mui/material';
import axios from 'axios';
import { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../Contexts/userContext';
import { Buffer } from 'buffer';
import React from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

type Props = {
  showUser: boolean;
  setShowUser: (doubleAuth: boolean) => void;
};

const SwitchDoubleAuthenticated = (props: Props) => {
  const { showUser, setShowUser } = props;
  const me = useContext(UserContext);
  const [checked, setChecked] = useState(me.user.isTwoFactorAuthenticationEnabled);
  const [qrcode, setQrcode] = useState('');
  const [checkCode, setCheckCode] = useState('');
  const [showOn, setShowOn] = useState<boolean>(false);
  const [showOff, setShowOff] = useState<boolean>(false);
  const [alertError, setAlertError] = useState<boolean>(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    if (event.target.checked) {
      axios
        .post(`${process.env.REACT_APP_DEFAULT_URL}/2fa/generate`, {}, { withCredentials: true, responseType: 'arraybuffer' })
        .then((res) => setQrcode(Buffer.from(res.data, 'binary').toString('base64')))
        .catch((err) => console.log(err));
      setShowUser(false);
      setShowOff(false);
    } else {
      axios
        .get(`${process.env.REACT_APP_DEFAULT_URL}/2fa/turn-off`, { withCredentials: true })
        .then((res) => setShowOff(true))
        .catch((err) => console.log(err));
      setQrcode('');
      setShowUser(true);
      me.setUser({ ...me.user, isTwoFactorAuthenticationEnabled: false });
    }
  };

  const handleCodeCheckChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (alertError === true) setAlertError(false);
    setCheckCode(event.currentTarget.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (checked === true) {
      axios
        .post(`${process.env.REACT_APP_DEFAULT_URL}/2fa/turn-on`, { twoFactorAuthenticationCode: checkCode }, { withCredentials: true })
        .then((res) => {
          setShowOn(true);
          me.setUser({ ...me.user, isTwoFactorAuthenticationEnabled: true });
          setShowUser(true);
          setQrcode('');
        })
        .catch((err) => setAlertError(true));
    }
  };

  ///////// Snackbar <SUCCESS 2FWA TURN ON> ///////////
  const handleCloseOn = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowOn(false);
  };

  const handleCloseOff = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowOff(false);
  };
  const handleCloseError = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertError(false);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <Grid container alignItems="center">
          <Switch onChange={handleChange} checked={checked} color="secondary" />
          <span>{checked ? 'Disable 2FA' : 'Enable 2FA'}</span>
        </Grid>
        {qrcode && (
          <Grid container direction="column" alignItems="center">
            <img src={`data:image/png;base64, ${qrcode}`} />
            <TextField id="outlined-basic" label="EnterCode" variant="outlined" type="text" value={checkCode} onChange={handleCodeCheckChange} size="small" sx={{ marginTop: '20px' }} />
            <Button type="submit" variant="outlined" sx={{ marginTop: '10px' }}>
              Confirm
            </Button>
            {alertError && <Alert severity="error">Error: Wrong Code</Alert>}
          </Grid>
        )}
      </form>
      <Snackbar open={showOn} autoHideDuration={6000} onClose={handleCloseOn}>
        <Alert onClose={handleCloseOn} severity="success" sx={{ width: '100%' }}>
          Success: 2FA has been turned on.
        </Alert>
      </Snackbar>
      <Snackbar open={showOff} autoHideDuration={6000} onClose={handleCloseOff}>
        <Alert onClose={handleCloseOff} severity="success" sx={{ width: '100%' }}>
          Success: 2FA has been turned off.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default SwitchDoubleAuthenticated;
