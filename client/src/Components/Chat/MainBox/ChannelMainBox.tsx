import React, { useContext, useState } from 'react';
import Channel from '../../../Interfaces/channel.interface';
import User from '../../../Interfaces/user.interface';
import ChannelAdminFeatures from './channelManagement/ChannelAdminFeatures';
import ChannelOwnerFeatures from './channelManagement/ChannelOwnerFeatures';
import MessageList from '../MainBox/messages/MessageList';
import SendMessage from '../MainBox/messages/SendMessage';
import { Button, Stack, Divider, TextField, Grid, Paper, Box, Zoom, FormControlLabel, Switch, FormGroup } from '@mui/material';
import Message from '../../../Interfaces/message.interface';
import { UserContext } from '../../../Contexts/userContext';
import MemberList from '../MainBox/MemberList';
import ChannelManagement from './channelManagement/ChannelManagement';
import LeaveChannel from './LeaveChannel';
import '../../../CSS/neon.css'

type Props = {
  activeChannel: Channel;
  adminList: User[];
  memberList: User[];
  banList: User[];
  muteList: User[];
  userList: User[];
  messageList: Message[];
  setActiveChannel: (channel: Channel | undefined) => void;
  isDirectMessageChannel: (channel: Channel) => boolean;
};

const ChannelMainBox = (props: Props) => {
  const { activeChannel, setActiveChannel, adminList, memberList, banList, muteList, userList, messageList, isDirectMessageChannel } = props;
  const me = useContext(UserContext).user;
  const [muteTime, setMuteTime] = useState<number>(0);
  const [showManage, setShowManage] = useState<boolean>(false);

  // isBanned(): is this member banned ?
  function isBanned(user: User) {
    let res: boolean = false;
    banList.map((e) => (e.id === user.id ? (res = true) : null));
    return res;
  }

  // isAdmin(): is this member an admin?
  function isAdmin(user: User) {
    let res: boolean = false;
    adminList.map((e) => (e.id === user.id ? (res = true) : null));
    return res;
  }

  // isDM(): is this channel a Direct Message channel?
  function isDM(channel: Channel) {
    const name: string = channel.name;
    if (name.substring(0, 3) === 'dm-') return true;
    return false;
  }

  // if DM --> get other user's name
  function getOtherUsername() {
    let username: string = '';
    memberList.map((user: User) => (user.username !== me.username ? (username = user.username) : null));
    return username;
  }

  return (
    <div>
      <Grid container sx={{ marginLeft: '5px' }}>
        <Grid item xs={12} md={9}>
          <Paper sx={{ height: '75vh', overflowY: 'auto', marginBottom: '20px' }}>
            <span style={{ display: 'flex', justifyContent: 'center'}}>
            <h2 className='neon'>
              {'Channel: '}
              {isDM(activeChannel) ? getOtherUsername() : activeChannel.name}
            </h2>
            </span>
            {showManage && !isDirectMessageChannel(activeChannel) ? (
              <ChannelManagement
                activeChannel={activeChannel}
                adminList={adminList}
                memberList={memberList}
                banList={banList}
                muteList={muteList}
                userList={userList}
                muteTime={muteTime}
                setMuteTime={setMuteTime}
                isBanned={isBanned}
                isAdmin={isAdmin}
                setActiveChannel={setActiveChannel}
              />
            ) : (
              <MessageList messageList={messageList} />
            )}
          </Paper>
        </Grid>
        <Grid item md={3} sx={{ paddingLeft: '10px' }}>
          {isAdmin(me) && !isDM(activeChannel) ? (
            <FormGroup>
              <FormControlLabel control={<Switch checked={showManage} onChange={() => setShowManage(!showManage)} />} label="Show Channel Features" />
            </FormGroup>
          ) : null}
          <MemberList activeChannel={activeChannel} muteList={muteList} memberList={memberList} adminList={adminList} isBanned={isBanned} muteTime={muteTime} setMuteTime={setMuteTime} />
          {me.id === activeChannel.owner.id ? '' : <LeaveChannel activeChannel={activeChannel} setActiveChannel={setActiveChannel} />}
        </Grid>
        <Grid item xs={12}>
          <SendMessage activeChannel={activeChannel} muteList={muteList} memberList={memberList} />
        </Grid>
      </Grid>
    </div>
  );
};

export default ChannelMainBox;
