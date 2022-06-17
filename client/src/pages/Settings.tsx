import { Container } from '@mui/material';
import React, { useContext } from 'react';
import { useParams } from 'react-router-dom';
import MainSettings from '../Components/Settings/MainSettings';
import { UserContext } from '../Contexts/userContext';
import User from '../Interfaces/user.interface';

type Props = {};

const Settings = (props: Props) => {
  const me: User = useContext(UserContext).user;
  const param = useParams();
  return (
    <Container sx={{ backgroundColor: 'rgb(35,35,35)', height: '100vh' }} maxWidth="xl">
      {me.id === param.userId ? <MainSettings user={me} /> : <></>}
    </Container>
  );
};

export default Settings;
