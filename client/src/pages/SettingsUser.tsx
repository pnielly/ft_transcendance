import { Typography, Button, Grid, Input } from '@mui/material';
import React, { useContext, useEffect, useState } from 'react';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { UserRanking } from './Ranking.pages';
import Profile from '../Components/Profile/Profile';
import { UserContext } from '../Contexts/userContext';

const SettingsUser = () => {
  const { register, handleSubmit } = useForm();
  const me = useContext(UserContext).user;
  const [ranking, setRanking] = useState<UserRanking | undefined>(undefined);

  useEffect(() => {
    axios
      .get<UserRanking>(`${process.env.REACT_APP_DEFAULT_URL}/ranking/${me.id}`, { withCredentials: true })
      .then((res) => setRanking(res.data))
      .catch((err) => console.log(err));
  }, []);

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append('image', data.file[0]);
    axios
      .post(`${process.env.REACT_APP_DEFAULT_URL}/upload`, formData, {
        headers: {
          'Content-Type': `multipart/form-data`
        },
        withCredentials: true
      })
      .then((res) => alert(`${res.status}`))
      .catch((err) => console.log(err));
  };

  return (
    <React.Fragment>
      {ranking ? <Profile profile={ranking} /> : <></>}
      <Grid container justifyContent="center" sx={{ margin: '40px' }}>
        <Grid item>
          <FormGroup>
            <FormControlLabel control={<Switch />} label="Double Authentification" />
          </FormGroup>
          <Typography variant="body1">Change Avatar image</Typography>
          <form onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
            <Input type="file" {...register('file')}></Input>
            <Input type="submit" aria-label="Upload"></Input>
          </form>
          <Button> Change Username</Button>
          <Typography variant="body1">Ask for UserName on first Login</Typography>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

export default SettingsUser;
