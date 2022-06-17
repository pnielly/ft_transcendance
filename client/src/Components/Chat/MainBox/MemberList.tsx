import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { ListItemButton, AvatarGroup, Button, Paper } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../../Contexts/userContext';
import Ban from './channelManagement/adminFeatures/Ban';
import Mute from './channelManagement/adminFeatures/Mute';
import Unmute from './channelManagement/adminFeatures/Unmute';
import SetAdmin from './channelManagement/ownerFeatures/SetAdmin';
import Countdown from 'react-countdown';
import User from '../../../Interfaces/user.interface';
import Channel from '../../../Interfaces/channel.interface';
import { useNavigate } from 'react-router-dom';
import { Typography, Grid } from '@mui/material';
import ReactTimeAgo from 'react-time-ago';

type Props = {
  memberList: User[];
  muteList: User[];
  adminList: User[];
  isBanned: (user: User) => boolean;
  activeChannel: Channel;
  muteTime: number;
  setMuteTime: (time: number) => void;
};

const MemberList = (props: Props) => {
  let navigate = useNavigate();
  const { memberList, muteList, activeChannel, adminList, isBanned, muteTime, setMuteTime } = props;
  const [selectedUser, setSelectedUser] = useState<User>();
  const me = useContext(UserContext).user;
  const [collapseList, setCollapseList] = useState<boolean>(false);

  // IsMember(): is this user a member ?
  function isMute(user: User) {
    let res: boolean = false;
    muteList.map((e) => (e.id === user.id ? (res = true) : null));
    return res;
  }

  // isAdmin(): is this member an admin?
  function isAdmin(user: User) {
    let res: boolean = false;
    adminList.map((e) => (e.id === user.id ? (res = true) : null));
    return res;
  }

  function findRole(user: User) {
    if (activeChannel.owner.id === user.id) return 'owner';
    else if (isAdmin(user)) return 'admin';
    return 'member';
  }

  function navigateToProfile(e: React.MouseEvent<HTMLButtonElement>, selectedUser: User) {
    e.preventDefault();
    navigate('/users', { state: selectedUser });
  }

  function isSelected(u: User) {
    return (
      <div>
        <Grid container justifyContent="center" columnSpacing={1}>
          <Avatar alt={u.username} src={u.avatar} />
          <Typography>{u.username}</Typography>
        </Grid>
        <Mute activeChannel={activeChannel} isAdmin={isAdmin} isMute={isMute} user={u} setMuteTime={setMuteTime} muteTime={muteTime} />
        {isMute(u) ? <ReactTimeAgo future date={Date.now() + muteTime} locale="en-US" style={{ fontSize: '10px', fontWeight: 'lighter' }} /> : ''}
        <Unmute muteList={muteList} activeChannel={activeChannel} user={u} />
        <Ban activeChannel={activeChannel} isAdmin={isAdmin} isBanned={isBanned} user={u} />
        {/* SetAdmin belongs to ownerFeatures */}
        {isAdmin(u) ? '' : <SetAdmin activeChannel={activeChannel} isAdmin={isAdmin} user={u} />}
        <Button onClick={(e) => navigateToProfile(e, u)}>See profile</Button>
      </div>
    );
  }

  const collapseMemberList = () => {
    return (
      <List sx={{ height: '60vh', overflowY: 'auto' }}>
        {memberList.map((u: User) => (
          <ListItemButton
            key={u.id}
            onClick={() => {
              setSelectedUser(u);
            }}
          >
            {u.id !== me.id && selectedUser?.id === u.id && isAdmin(me) ? (
              isSelected(u)
            ) : (
              <div>
                <ListItemIcon>
                  <Avatar alt={u.username} src={u.avatar} />
                </ListItemIcon>
                <ListItemText primary={u.username}>{u.username}</ListItemText>
                <ListItemText secondary={findRole(u)}></ListItemText>
              </div>
            )}
            {selectedUser?.id === u.id && !isAdmin(me) ? <Button onClick={(e) => navigateToProfile(e, u)}>See profile</Button> : ''}
          </ListItemButton>
        ))}
      </List>
    );
  };

  const groupedMemberList = () => {
    return (
      <AvatarGroup max={3} key={'memberList'}>
        {memberList.map((user: User, index: number) => (
          <Avatar alt={user.username} src={user.avatar} key={index} />
        ))}
      </AvatarGroup>
    );
  };

  return (
    <div>
      {' '}
      <h4>{'MemberList'}</h4>
      <Button onClick={() => setCollapseList(!collapseList)}>{collapseList ? null : groupedMemberList()}</Button>
      {collapseList ? <Button onClick={() => setCollapseList(!collapseList)}>Minimize</Button> : null}
      {collapseList ? collapseMemberList() : null}
    </div>
  );
};

export default MemberList;
