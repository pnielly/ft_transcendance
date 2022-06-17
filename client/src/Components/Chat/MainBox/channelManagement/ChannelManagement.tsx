import React, { useContext, useState } from 'react';
import Channel from '../../../../Interfaces/channel.interface';
import Message from '../../../../Interfaces/message.interface';
import User from '../../../../Interfaces/user.interface';
import { Button, Stack, Divider, TextField, Grid, Paper, Box, Zoom, FormControlLabel, Switch, FormGroup } from '@mui/material';
import MemberList from '../MemberList';
import { UserContext } from '../../../../Contexts/userContext';
import ChannelOwnerFeatures from './ChannelOwnerFeatures';
import ChannelAdminFeatures from './ChannelAdminFeatures';

type Props = {
  activeChannel: Channel;
  adminList: User[];
  memberList: User[];
  banList: User[];
  muteList: User[];
  userList: User[];
  muteTime: number;
  setMuteTime: (time: number) => void;
  isBanned: (user: User) => boolean;
  isAdmin: (user: User) => boolean;
  setActiveChannel: (channel: Channel | undefined) => void;
};

const ChannelManagement = (props: Props) => {
  const { activeChannel, adminList, memberList, banList, muteList, userList, muteTime, setMuteTime, isBanned, isAdmin, setActiveChannel } = props;
  const [showManage, setShowManage] = useState<boolean>(false);
  const me = useContext(UserContext).user;

  return (
    <Grid container justifyContent="space-around">
      {isAdmin(me) ? (
        <ChannelAdminFeatures
          activeChannel={activeChannel}
          adminList={adminList}
          memberList={memberList}
          banList={banList}
          muteList={muteList}
          userList={userList}
          muteTime={muteTime}
          setMuteTime={setMuteTime}
          isBanned={isBanned}
        />
      ) : (
        ''
      )}
      {activeChannel.owner.id === me.id ? <ChannelOwnerFeatures activeChannel={activeChannel} adminList={adminList} setActiveChannel={setActiveChannel} memberList={memberList} /> : ''}
    </Grid>
  );
};

export default ChannelManagement;
