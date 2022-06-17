import React, { useState, useContext, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import Badge from '@mui/material/Badge';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { UserContext } from '../../Contexts/userContext';
import ChatIcon from '@mui/icons-material/Chat';
import { SocketContext } from '../../Contexts/socket';
import ChatInvite from '../../Interfaces/chatInvite';
import axios from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

type Props = {};

const ChatInvites = (props: Props) => {
  const [anchorElInvites, setAnchorElInvites] = useState<(EventTarget & HTMLButtonElement) | null>(null);
  const sockContext = useContext(SocketContext);
  const me = useContext(UserContext).user;
  const [chatInvites, setChatInvites] = useState<ChatInvite[]>([]);
  const [inviteAccepted, setInviteAccepted] = useState<boolean>(false);

  const handleOpenInvitesMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElInvites(event.currentTarget);
  };

  const handleCloseInvitesMenu = () => {
    setAnchorElInvites(null);
  };

  ////////////////////////////// UPDATE INVITE LIST //////////////////////

  // updateChannelInviteList
  const updateInviteList = useCallback(() => {
    console.log('updteList')
    axios
      .get(`${process.env.REACT_APP_DEFAULT_URL}/users/${me.id}/get_chat_invites`, { withCredentials: true })
      .then((res) => setChatInvites(res.data))
      .catch((err) => console.log(err));
  }, [me]);

  // update on start
  useEffect(() => {
    updateInviteList();
  }, []);

  // update on change
  useEffect(() => {
    console.log('chat invite')
    sockContext.socketChat.on('updateChatInviteList', updateInviteList);
    return () => {
      console.log('socket off')
      sockContext.socketChat.off('updateChatInviteList', updateInviteList);
    }
  }, []);

  ////////////// Snackbar <Invite accepted> ///////////////
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setInviteAccepted(false);
  };

  return (
    <div>
      <Box sx={{ flexGrow: 0, margin: '0 5px 0 5px' }}>
        <Tooltip title="Chat invitations">
          <IconButton onClick={handleOpenInvitesMenu} sx={{ p: 0 }}>
            <Badge color="secondary" badgeContent={chatInvites.length} className={chatInvites.length ? 'neon' : 'none'} >
              <ChatIcon />
            </Badge>
          </IconButton>
        </Tooltip>
        <Menu
          sx={{ mt: '45px' }}
          id="menu-appbar"
          anchorEl={anchorElInvites}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right'
          }}
          open={Boolean(anchorElInvites)}
          onClose={handleCloseInvitesMenu}
        >
          {chatInvites[0] ? (
            chatInvites.map((i: ChatInvite) => (
              <MenuItem key={i.channelId} value={i.channelId}>
                <Typography textAlign="center">{i.channelName}</Typography>
                <IconButton
                  onClick={() => {
                    sockContext.socketChat.emit('inviteResponse', { accept: true, invite: i });
                    setInviteAccepted(true);
                  }}
                >
                  <CheckCircleIcon />
                </IconButton>
                <IconButton onClick={() => sockContext.socketChat.emit('inviteResponse', { accept: false, invite: i })}>
                  <CancelIcon />
                </IconButton>
              </MenuItem>
            ))
          ) : (
            <MenuItem key={'default'}>
              <Typography textAlign="center">{'No channel invite for the moment.'}</Typography>
            </MenuItem>
          )}
        </Menu>
      </Box>
      <Snackbar open={inviteAccepted} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Channel added to your list.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ChatInvites;
