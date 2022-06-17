import { useForm, SubmitHandler, Controller, FieldValues } from 'react-hook-form';
import axios from 'axios';
import User from '../../Interfaces/user.interface';
import { Button, TextField, Alert, AlertTitle, Grid, Snackbar } from '@mui/material';
import { useState } from 'react';

type Props = {
  user: User | undefined;
};

const ChangeUsername = (props: Props) => {
  const { control, handleSubmit } = useForm();
  const [alert, setAlert] = useState(false);
  const [alertContent, setAlertContent] = useState('');

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (!data) return;
    axios
      .patch(`${process.env.REACT_APP_DEFAULT_URL}/users/${props.user?.id}`, data, { withCredentials: true })
      .then((res) => window.location.reload())
      .catch((err) => {
        setAlertContent(err.response.data.message);
        setAlert(true);
      });
  };

  const handlekey = (e: any) => {
    if (e.key === 'Enter') e.preventDefault();
  };
  const handleCloseAlert = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert(false);
  };

  return (
    <div>
      <form>
        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, value } }) => (
            <TextField
              sx={{ width: '100%' }}
              onKeyDown={handlekey}
              onChange={onChange}
              value={value || ''}
              label={'Change Username'}
              variant={'standard'}
              error={value === ''}
              helperText={value === '' ? 'Empty field' : ''}
            />
          )}
        />
        <Button sx={{ marginTop: '14px' }} onClick={handleSubmit(onSubmit)}>
          Submit
        </Button>
      </form>
      <div>
        <Snackbar open={alert} autoHideDuration={6000} onClose={handleCloseAlert}>
          <Alert variant="outlined" severity="error">
            {`Error Message: ${alertContent}`}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default ChangeUsername;
