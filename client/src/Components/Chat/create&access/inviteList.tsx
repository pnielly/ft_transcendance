import { ListItem, ListItemText, Button, Grid, Typography, List } from '@mui/material';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import Channel from '../../Interfaces/channel.interface';

type Props = {
  setActiveChannel: (channel: Channel) => void;
};

interface invite {
  channelId: number;
  channelName: string;
  guestId: number;
}

const InviteList = (props: Props) => {
  const { setActiveChannel } = props;
  const sockContext = useContext(SocketContext);
  const [invitations, setInvitations] = useState<invite[]>([]);
  const [latestInvit, setLatestInvit] = useState<invite |undefined >(undefined)

  const updateInviteList = (newInvitation: invite) => {
      setLatestInvit(newInvitation)
};

    useEffect(()=> {
        if (latestInvit && !invitations.find(elem => elem.channelId === latestInvit.channelId)) setInvitations(state => [...state, latestInvit])
    }, [latestInvit])

  useEffect(() => {
    sockContext.socketChat.on('inviteChannel', updateInviteList);
  }, []);

  const displayInvite = (invite: invite) => {
    return (
      <ListItem key={Math.random()} alignItems="flex-start">
        <ListItemText primary={invite.channelName}>{invite.channelName}</ListItemText>
        <Button color="success" value="accept" onClick={(e) => handleInvitation(e, invite)}>
          Accept
        </Button>
        <Button color="error" value="refuse" onClick={(e) => handleInvitation(e, invite)}>
          Refuse
        </Button>
      </ListItem>
    );
  };

  const handleInvitation = (e: React.MouseEvent<HTMLButtonElement>, invite: invite) => {
      e.preventDefault()
    // emit answer to add channel to visible channels (necessary if private)
    const answer = { accept: e.currentTarget.value === 'accept' ? true : false, invite: invite };
    sockContext.socketChat.emit('inviteResponse', answer);
    // activeChannel = channel
    if (answer.accept === true) {
        axios.get<Channel>(`${process.env.REACT_APP_DEFAULT_URL}/channels/${invite.channelId}`).then((res) => setActiveChannel(res.data)).catch((err) => console.log(err))
    }
    const joined = invitations.filter((i) => i.channelId !== invite.channelId);
    setInvitations(joined);
  };

  return (
    <Grid container sx={{ padding: '20px' }}>
      <Typography variant="h5"> Channel Invitations:</Typography>
      <Grid item xs={6}>
        <List>{invitations.map((e) => displayInvite(e))}</List>
      </Grid>
    </Grid>
  );
};

export default InviteList;
