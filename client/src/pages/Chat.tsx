import React, { useState, useEffect, useContext, useCallback } from 'react';
import UsersList from '../Components/Chat/userList';
import ChannelList from '../Components/Chat/channelList';
import { Button, Stack, Divider, TextField, Grid, Paper } from '@mui/material';
import FriendsList from '../Components/Chat/friendList';
import axios from 'axios';
import Channel from '../Components/Interfaces/channel.interface';
import Message from '../Components/Interfaces/message.interface';
import MessageList from '../Components/Chat/messages/messageList';
import { UserContext } from '../Contexts/userContext';
import { SocketContext } from '../Contexts/socket';
import ChannelOwnerFeatures from '../Components/Chat/channelOwnerFeatures';
import User from '../Components/Interfaces/user.interface';
import ChannelAdminFeatures from '../Components/Chat/channelAdminFeatures';
import SendMessage from '../Components/Chat/messages/sendMessage';

const Chat = () => {
  const [activeButton, setActiveButton] = useState('channel');
  const [channelList, setChannelList] = useState<Channel[]>([]);
  const [activeChannel, setActiveChannel] = useState<Channel>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState<string>('');
  const me = useContext(UserContext).user;
  const sockContext = useContext(SocketContext);
  const [adminList, setAdminList] = useState<User[]>([]);
  const [memberList, setMemberList] = useState<User[]>([]);
  const [banList, setBanList] = useState<User[]>([]);
  const [muteList, setMuteList] = useState<User[]>([]);
  const [userList, setUserList] = useState<User[]>([]);

  // join own channel where all personnal requests will be received (invitations to join games, channels, friend requests)
  useEffect(() => {
    sockContext.socketChat.emit('online', me.id);
  }, [sockContext.socketChat, me.id]);

  // MISE EN PAGE ///////////////////////////

  const handleActiveButton = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    const button: HTMLButtonElement = event.currentTarget;
    setActiveButton(button.value);
  };

  const NavButton = (props: { name: string }) => (
    <Button variant={isActive(props.name)} sx={{ width: '100%' }} onClick={handleActiveButton} value={props.name}>
      {props.name}
    </Button>
  );

  const isActive = (value: string): 'contained' | 'outlined' => {
    if (value === activeButton) return 'contained';
    return 'outlined';
  };

  const ActiveList = () => {
    if (activeButton === 'all') return <UsersList />;
    else if (activeButton === 'friend') return <FriendsList channelList={channelList} setActiveChannel={setActiveChannel} />;
    return <ChannelList setActiveChannel={setActiveChannel} channelList={channelList} />;
  };

  // handleInput
  const handleInput = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setInput(e.currentTarget.value);
  };

  // UPDATING /////////////////////////////////////////////////////////////////////////////////////////

  // UPDATING CHANNELS /////////////////////////////////////////////////////////////////////////////////
  const updateChannels = useCallback(() => {
    axios
      .post<Channel[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/user_channels`, { id: me.id })
      .then((res) => {
        setChannelList(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  // update Channels at first rendering
  useEffect(() => {
    updateChannels();
  }, [updateChannels]);

  // update Channels when new channel created orchannel deleted
  useEffect(() => {
    sockContext.socketChat.on('channelListUpdated', updateChannels);
  }, [sockContext.socketChat, updateChannels]);

  // UPDATING MESSAGES ///////////////////////////////////////////////////////////////////////////////////
  const updateMessage = useCallback(() => {
    if (activeChannel) {
      axios
        .get<Message[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${activeChannel.id}/messages`)
        .then((res) => setMessages(res.data))
        .catch((err) => console.log(err));
    }
  }, [activeChannel]);

  // update message history of activeChannel when entering a new channel (to display the correspondent history)
  useEffect(() => {
    updateMessage();
  }, [activeChannel, updateMessage]);

  // update message history of activeChannel when new message is being posted
  useEffect(() => {
    sockContext.socketChat.on('receivedMessage', updateMessage);
  }, [sockContext.socketChat, updateMessage]);

  ///////////////////////////////////////////////////////////////////////////////////////////////////////

  // UPDATING ADMIN, BANNED, MEMBER, MUTE AND USER LISTS /////////////////////////////////////////////////
  const updateMemberList = useCallback(() => {
    if (activeChannel) {
      axios
        .get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${activeChannel.id}/get_members`)
        .then((res) => setMemberList(res.data))
        .catch((err) => console.log(err));
      memberList.map((e) => console.log(e.username));
    }
  }, [activeChannel]);

  const updateAdminList = useCallback(() => {
    if (activeChannel) {
      axios
        .get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${activeChannel.id}/get_admins`)
        .then((res) => setAdminList(res.data))
        .catch((err) => console.log(err));
    }
  }, [activeChannel]);

  // update banList
  const updateBanList = useCallback(() => {
    if (activeChannel) {
      axios
        .get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${activeChannel.id}/get_banned`)
        .then((res) => setBanList(res.data))
        .catch((err) => console.log(err));
    }
  }, [activeChannel]);

  // update muteList
  const updateMuteList = useCallback(() => {
    if (activeChannel) {
      axios
        .get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${activeChannel.id}/get_muted`)
        .then((res) => setMuteList(res.data))
        .catch((err) => console.log(err));
    }
  }, [activeChannel]);

  // update userList
  const updateUserList = useCallback(() => {
    if (activeChannel) {
      axios
        .get<User[]>(`${process.env.REACT_APP_DEFAULT_URL}/users`)
        .then((res) => setUserList(res.data))
        .catch((err) => console.log(err));
    }
  }, [activeChannel]);

  // update adminList, memberList, banList, muteList and userList from start
  useEffect(() => {
    updateAdminList();
    updateMemberList();
    updateBanList();
    updateMuteList();
    updateUserList();
  }, [updateAdminList, updateMemberList, updateBanList, updateMuteList, updateUserList]);

  // update memberList on change
  useEffect(() => {
    sockContext.socketChat.on('updateMemberList', updateMemberList);
  }, [sockContext.socketChat, updateMemberList]);

  // update adminList on change
  useEffect(() => {
    sockContext.socketChat.on('updateAdminList', updateAdminList);
  }, [sockContext.socketChat, updateAdminList]);

  // update banList on change
  useEffect(() => {
    sockContext.socketChat.on('updateBanList', updateBanList);
  }, [sockContext.socketChat, updateBanList]);

  // update muteList on change
  useEffect(() => {
    sockContext.socketChat.on('updateMuteList', updateMuteList);
  }, [sockContext.socketChat, updateMuteList]);

  // update userList on change
  useEffect(() => {
    sockContext.socketChat.on('updateUserList', updateUserList);
  }, [sockContext.socketChat, updateUserList]);

  ////////////////////////////////////////////////////////

  return (
    <div>
      <Grid container component={Paper} sx={{ width: '100%', height: '80vh' }}>
        <Grid item xs={3} sx={{ borderRight: '1px solid #e0e0e0' }}>
          <Grid item xs={12} sx={{ padding: '10px' }}>
            <TextField id="outlined-basic-email" label="Search" variant="outlined" fullWidth onChange={handleInput} value={input} />
          </Grid>
          <Divider />
          <Stack spacing={1} direction="row" justifyContent="space-around" sx={{ padding: '10px', flex: 1 / 3 }} flex={1 / 3}>
            <NavButton name="salon" />
            <NavButton name="friend" />
            <NavButton name="all" />
          </Stack>
          <Divider />
          <ActiveList />
        </Grid>
        <Grid item xs={9}>
          {activeChannel ? (
            <>
              {'Current channel: '}
              {activeChannel.name}{' '}
              {'active Channel owner: '}
              {activeChannel.owner.username}{' '}
              <ChannelOwnerFeatures activeChannel={activeChannel} adminList={adminList} memberList={memberList} />
              <ChannelAdminFeatures activeChannel={activeChannel} adminList={adminList} memberList={memberList} banList={banList} muteList={muteList} userList={userList} />
              {messages ? <MessageList messages={messages} /> : 'Pas de message pour le moment dans ce salon...'}
              <Divider />
              <SendMessage activeChannel={activeChannel} muteList={muteList} />
            </>
          ) : (
            'Open a channel'
          )}
        </Grid>
      </Grid>
    </div>
  );
};

export default Chat;
