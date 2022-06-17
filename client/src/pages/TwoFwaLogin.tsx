import { Alert, Button, Container, Grid, Snackbar, TextField } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { useForm, SubmitHandler, FieldValues, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import '../CSS/rainbow.css';

const TwoFwaLogin = () => {
  const { control, handleSubmit } = useForm();
  const [alert, setAlert] = useState(false);
  let navigate = useNavigate();

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    axios
      .post(`${process.env.REACT_APP_DEFAULT_URL}/2fa/authenticate`, { twoFactorAuthenticationCode: data.twoFactorAuthenticationCode }, { withCredentials: true })
      .then((res) => navigate(`/game`))
      .catch((err) => setAlert(true));
  };

  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert(false);
  };

  const handlekey = (e: any) => {
    if (e.key === 'Enter') e.preventDefault();
  };

  return (
    <Container maxWidth="md">
      <Grid container justifyContent="center" sx={{ marginTop: '100px' }}>
        <Grid item xs={12}>
          <h2 className="classic">Two Factor Authentication</h2>
        </Grid>
        <Grid item md={8} xs={10}>
          <form>
            <Controller
              control={control}
              name="twoFactorAuthenticationCode"
              render={({ field: { onChange, value } }) => (
                <TextField
                  sx={{ width: '100%' }}
                  onChange={onChange}
                  onKeyDown={handlekey}
                  value={value || ''}
                  label={'Enter Code'}
                  variant={'standard'}
                  error={value === ''}
                  helperText={value === '' ? 'Empty field' : ''}
                />
              )}
            />
            <Button sx={{ marginTop: '14px' }} onClick={handleSubmit(onSubmit)} size="large">
              Submit
            </Button>
          </form>
        </Grid>
      </Grid>
      <Snackbar open={alert} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="error" sx={{ width: '100%' }}>
          {'Wrong code, Authentication failed'}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default TwoFwaLogin;
