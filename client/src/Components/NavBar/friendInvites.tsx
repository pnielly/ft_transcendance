import EmojiPeopleIcon from '@mui/icons-material/EmojiPeople';
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { UserContext } from '../../Contexts/userContext';
import User from '../../Interfaces/user.interface';
import axios from 'axios';
import { SocketContext } from '../../Contexts/socket';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Badge from '@mui/material/Badge';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

type Props = {};

const FriendInvites = (props: Props) => {
  const [anchorElInvites, setAnchorElInvites] = useState<(EventTarget & HTMLButtonElement) | null>(null);
  const me = useContext(UserContext).user;
  const [friendRequestList, setFriendRequestList] = useState<User[]>([]);
  const sockContext = useContext(SocketContext);
  const [inviteAccepted, setInviteAccepted] = useState<boolean>(false);

  const handleOpenInvitesMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElInvites(event.currentTarget);
  };

  const handleCloseInvitesMenu = () => {
    setAnchorElInvites(null);
  };

  ////////////////////////////// UPDATE INVITE LIST //////////////////////

  // update friendRequestList
  const updateFriendRequestList = useCallback(() => {
    console.log('udpateFriendRequest');
    axios
      .get(`${process.env.REACT_APP_DEFAULT_URL}/users/${me.id}/get_friend_requests`, { withCredentials: true })
      .then((res) => {
        setFriendRequestList(res.data);
      })
      .catch((err) => console.log(err));
  }, [me]);

  // update from start
  useEffect(() => {
    updateFriendRequestList();
  }, []);

  // update FriendRequestList on change
  useEffect(() => {
    console.log('updateFirend')
    sockContext.socketUser.on('updateFriendRequestList', updateFriendRequestList);
    return () => {
      sockContext.socketUser.off('updateFriendRequestList', updateFriendRequestList);
    }
  }, []);

  /////////////// RESPONSE TO INVITE ///////////////////////////////////////

  // private channel name builder
  function privateChannelName(id_a: string, id_b: string): string {
    if (id_a < id_b) return 'dm-' + id_a + id_b;
    else return 'dm-' + id_b + id_a;
  }

  const accept = (e: React.MouseEvent<HTMLButtonElement>) => {
    setInviteAccepted(true);
    sockContext.socketUser.emit('friendRequestResponse', { accept: true, name: privateChannelName(me.id, e.currentTarget.value), fromId: me.id, toId: e.currentTarget.value });
  };

  const decline = (e: React.MouseEvent<HTMLButtonElement>) => {
    sockContext.socketUser.emit('friendRequestResponse', { accept: false, name: privateChannelName(me.id, e.currentTarget.value), fromId: me.id, toId: e.currentTarget.value });
  };

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
        <Tooltip title="Friend requests">
          <IconButton onClick={handleOpenInvitesMenu} sx={{ p: 0 }}>
            <Badge color="secondary" badgeContent={friendRequestList.length} className={friendRequestList.length ? 'neon' : 'none'}>
              <EmojiPeopleIcon />
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
          {friendRequestList[0] ? (
            friendRequestList.map((i: User) => (
              <MenuItem key={i.id} value={i.id}>
                <Typography textAlign="center">{i.username}</Typography>
                <IconButton onClick={accept} value={i.id}>
                  <CheckCircleIcon />
                </IconButton>
                <IconButton onClick={decline} value={i.id}>
                  <CancelIcon />
                </IconButton>
              </MenuItem>
            ))
          ) : (
            <MenuItem key={'default'}>
              <Typography textAlign="center">{'No friend request for the moment.'}</Typography>
            </MenuItem>
          )}
        </Menu>
      </Box>
      <Snackbar open={inviteAccepted} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="success" sx={{ width: '100%' }}>
          Friend accepted !
        </Alert>
      </Snackbar>
    </div>
  );
};

export default FriendInvites;
