import { Avatar, Grid, List, ListItem, ListItemIcon, ListItemText, Typography, Button } from '@mui/material';
import axios from 'axios';
import React, { useContext, useEffect, useState } from 'react';
import { SocketContext } from '../../Contexts/socket';
import { UserContext } from '../../Contexts/userContext';
import User from '../Interfaces/user.interface';

type Props = {};

interface invite {
  sender: User;
  roomId: string;
}

interface answer {
  accept: boolean;
  invitation: invite;
  guest: User;
}

const GameInvitation = (props: Props) => {
  const sockContext = useContext(SocketContext);
  const me = useContext(UserContext).user;
  const [invitations, setInvitations] = useState<invite[]>([]);
  const [users, setUsers] = useState<User[] | []>([]);

  useEffect(() => {
    axios
      .get<User[]>(
        `${process.env.REACT_APP_DEFAULT_URL}/users
      `
      )
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => console.log(err));
  }, []);

  function updateInvitation(newInvitation: invite) {
    setInvitations((oldInvitation) => [...oldInvitation, newInvitation]);
  }

  useEffect(() => {
    sockContext.socketPong.on('pendingInvitation', updateInvitation);
  }, []);

  function handleInvitation(e: React.MouseEvent<HTMLButtonElement>, invitation: invite) {
    const answer: answer = { accept: e.currentTarget.value === 'accept' ? true : false, invitation: invitation, guest: me };
    sockContext.socketPong.emit('answerInvitation', answer);
    var joined = invitations.filter((elem) => elem.roomId != invitation.roomId);
    setInvitations(joined);
  }

  function handleExpiredInvite(invitation: invite) {
    alert(`Invitation of ${invitation.sender.username} has expired`);
  }

  useEffect(() => {
    sockContext.socketPong.on('invitationExpired', handleExpiredInvite);
  }, []);

  const isInvinting = (user: User) => {
    const invite = invitations.find((elem) => elem.sender.id == user.id);
    if (invite) {
      return (
        <ListItem key={Math.random()} alignItems="flex-start">
          <ListItemIcon>
            <Avatar alt={user.username} src={user.avatar} />
          </ListItemIcon>
          <ListItemText primary={user.username}>{user.username}</ListItemText>
          <Button color="success" value="accept" onClick={(e) => handleInvitation(e, invite)}>
            Accept
          </Button>
          <Button color="error" value="refuse" onClick={(e) => handleInvitation(e, invite)}>
            Refuse
          </Button>
        </ListItem>
      );
    }
  };

  return (
    <Grid container sx={{ padding: '20px' }}>
      <Typography variant="h5"> Game Invitations:</Typography>
      <Grid item xs={6}>
        <List>{users.map((user) => isInvinting(user))}</List>
      </Grid>
    </Grid>
  );
};

export default GameInvitation;
