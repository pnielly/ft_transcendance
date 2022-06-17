import { Grid } from '@mui/material';
import { useContext, useState, useEffect, useCallback } from 'react';
import Channel from '../../Interfaces/channel.interface';
import Message from '../../Interfaces/message.interface';
import User from '../../Interfaces/user.interface';
import UserDetails from './MainBox/userDetails';
import UserStats from './MainBox/UserStats';
import axios from 'axios';
import { SocketContext } from '../../Contexts/socket';

type Props = {
  selectedUser: User;
  myBlockList: User[];
  myFriendList: User[];
  activeChannel: Channel | undefined;
};

const UserMainBox = (props: Props) => {
  const { selectedUser, myBlockList, myFriendList, activeChannel } = props;

  return (
    <Grid container justifyContent="center" paddingBottom={'50px'}>
      <UserDetails selectedUser={selectedUser} myBlockList={myBlockList} myFriendList={myFriendList} activeChannel={activeChannel} />
      <UserStats selectedUser={selectedUser} />
    </Grid>
  );
};

export default UserMainBox;
