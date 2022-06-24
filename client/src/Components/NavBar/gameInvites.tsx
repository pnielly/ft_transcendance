import React, { useState, useContext, useEffect, useCallback } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import { useNavigate } from 'react-router-dom';
import { UserContext } from '../../Contexts/userContext';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import { SocketContext } from '../../Contexts/socket';
import GameInvite from '../../Interfaces/gameInvite';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import { userInfo } from '../../Interfaces/gameRoom.interface';

type Props = {};

const GameInvites = (props: Props) => {
  const [gameInvites, setGameInvites] = useState<GameInvite[]>([]);
  const sockContext = useContext(SocketContext);
  const [anchorElInvites, setAnchorElInvites] = useState<(EventTarget & HTMLButtonElement) | null>(null);
  const me = useContext(UserContext).user;
  let navigate = useNavigate();
  const [showExpired, setShowExpired] = useState<boolean>(false);

  const handleOpenInvitesMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorElInvites(event.currentTarget);
  };

  const handleCloseInvitesMenu = () => {
    setAnchorElInvites(null);
  };

  // // tell pong i m online
  // useEffect(() => {
  //   sockContext.socketPong.emit('online', me.id);
  // }, [sockContext.socketPong]);

  /////////// UPDATE GAME INVITES ///////////////////////////////////:

  const updateGameInvites = useCallback((updatedGameInvites: GameInvite[]) => {
    setGameInvites(updatedGameInvites);
  }, []);

  useEffect(() => {
    sockContext.socketPong.on('updateGameInviteList', updateGameInvites);
  }, [sockContext.socketPong]);

  ///////////////////////// GAME INVITE ACCEPTED ///////////////////////

  const joinGameRoom = useCallback((param: { invite: GameInvite; guest: userInfo }) => {
    let players = { player1: { ...param.invite.sender, status: 'online' }, player2: { ...param.guest, status: 'online' } };
    navigate(`/match/${param.invite.roomId}`, { state: { players: players, options: param.invite.options } });
  }, []);

  useEffect(() => {
    sockContext.socketPong.on('gameInviteAccepted', joinGameRoom);
    return () => {
      sockContext.socketPong.off('gameInviteAccepted');
    };
  }, []);

  /////////////////////// INVITATION EXPIRED /////////////////////////////

  const inviteExpired = useCallback((invite: GameInvite) => {
    setShowExpired(true);
    setTimeout(() => {
      setShowExpired(false);
    }, 5000);
  }, []);

  useEffect(() => {
    sockContext.socketPong.on('invitationExpired', inviteExpired);
    return () => {
      sockContext.socketPong.off('invitationExpired');
    };
  }, []);

  ///////// Snackbar <Invite Expired> ///////////
  const handleClose = (event: React.SyntheticEvent | Event, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setShowExpired(false);
  };

  ///////////////////////// INVITATION VALID /////////////////////////////////

  const inviteValid = useCallback((answer: { accept: boolean; invitation: GameInvite; guest: userInfo }) => {
    let players = { player1: { ...answer.invitation.sender, status: 'online' }, player2: { ...me, status: 'online' } };
    sockContext.socketPong.emit('answerInvitation', answer);
    navigate(`/match/${answer.invitation.roomId}`, { state: { players: players, options: answer.invitation.options } });
  }, []);

  useEffect(() => {
    sockContext.socketPong.on('invitationValid', inviteValid);
    return () => {
      sockContext.socketPong.off('invitationValid');
    };
  }, []);

  /////////////////////// RESPONSE TO INVITE //////////////////////////

  function getInvite(roomId: string) {
    const invite: GameInvite | undefined = gameInvites.find((i: GameInvite) => i.roomId === roomId);
    if (!invite) {
      alert('[Game Invite Error]: could not find the invite when you clicked on it.');
      return;
    }
    return invite;
  }

  const accept = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const invite: GameInvite | undefined = getInvite(e.currentTarget.value);
    if (invite) {
      sockContext.socketPong.emit('checkInviteExpired', { accept: true, invitation: invite, guest: me });
    }
    handleCloseInvitesMenu();
  };

  const decline = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const invite: GameInvite | undefined = getInvite(e.currentTarget.value);
    if (invite) sockContext.socketPong.emit('answerInvitation', { accept: false, invitation: invite, guest: me });
  };

  return (
    <div>
      <Box sx={{ flexGrow: 0, margin: '0 5px 0 5px' }}>
        <Tooltip title="Pong invitations">
          <IconButton onClick={handleOpenInvitesMenu} sx={{ p: 0 }}>
            <Badge color="secondary" badgeContent={gameInvites.length} className={gameInvites.length ? 'neon' : 'none'}>
              <SportsEsportsIcon />
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
          {gameInvites[0] ? (
            gameInvites.map((i: GameInvite) => (
              <MenuItem key={i.roomId} value={i.roomId}>
                <Typography textAlign="center">{i.sender.username}</Typography>
                <IconButton onClick={accept} value={i.roomId}>
                  <CheckCircleIcon />
                </IconButton>
                <IconButton onClick={decline} value={i.roomId}>
                  <CancelIcon />
                </IconButton>
              </MenuItem>
            ))
          ) : (
            <MenuItem key={'default'}>
              <Typography textAlign="center">{'No game invite for the moment.'}</Typography>
            </MenuItem>
          )}
        </Menu>
      </Box>
      <Snackbar open={showExpired} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity="warning" sx={{ width: '100%' }}>
          This invite has expired.
        </Alert>
      </Snackbar>
    </div>
  );
};

export default GameInvites;
