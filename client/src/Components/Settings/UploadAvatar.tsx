import { Typography, Button, Alert } from '@mui/material';
import { useContext, useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { UserContext } from '../../Contexts/userContext';
import User from '../../Interfaces/user.interface';
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import PhotoCamera from '@mui/icons-material/PhotoCamera';

type Props = {
  user: User;
};

const Input = styled('input')({
  display: 'none'
});

const Avatar = (props: Props) => {
  const { register, handleSubmit } = useForm();
  const me = useContext(UserContext).user;
  const [alert, setAlert] = useState(false);

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
      .then((res) => window.location.reload())
      .catch((err) => setAlert(true));
  };

  return (
    <div>
      <Typography variant="body1" textAlign="center" paddingBottom="5px">
        Change Avatar image
      </Typography>
      <form encType="multipart/form-data">
        <label htmlFor="icon-button-file">
          <Input accept="image/*" id="icon-button-file" type="file" {...register('file')} />
          <IconButton color="primary" aria-label="upload picture" component="span">
            <PhotoCamera />
          </IconButton>
        </label>
        <Button onClick={handleSubmit(onSubmit)}>Upload</Button>
      </form>
      {alert && <Alert severity="error">{'Upload failed try again'}</Alert>}
    </div>
  );
};

export default Avatar;
