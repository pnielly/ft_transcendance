import List from '@mui/material/List';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import { ListItemButton } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { useContext, useState, useEffect } from 'react';
import { UserContext } from '../../../../Contexts/userContext';
import Channel from '../../../../Interfaces/channel.interface';
import User from '../../../../Interfaces/user.interface';
import InviteToChannel from './adminFeatures/InviteToChannel';
import Unban from './adminFeatures/Unban';
import { SocketContext } from '../../../../Contexts/socket';
import AdminList from './ownerFeatures/AdminList';

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
};

// ADMIN CAN :
// - ban users
// - mute users for a limited time 
// - add users (useful if the channel is private)

// NOTE: You can't ban an admin

const ChannelAdminFeatures = (props: Props) => {
  const { activeChannel, adminList, memberList, banList, muteList, userList, isBanned, muteTime, setMuteTime } = props;
  const me = useContext(UserContext).user;
  const [selectedUser, setSelectedUser] = useState<User>();
  const sockContext = useContext(SocketContext);

  // IsMember(): is this user a member ?
  function isMember(user: User) {
    let res: boolean = false;
    memberList.map((e) => (e.id === user.id ? (res = true) : null));
    return res;
  }

  useEffect(() => {
    if (!muteTime) {
      sockContext.socketChat.emit('removeMute', { channelId: activeChannel.id, muteId: selectedUser?.id });
    }
  }, [muteTime]);

  return (
    <div>
      {/* SHOW ADMIN FEATURES */}
      <h3>{'Admin Section'}</h3>
      <h4>{'Admin List'}</h4>
      <AdminList adminList={adminList} activeChannel={activeChannel} />
      <h4>{'Ban List'}</h4>
      {!banList.length ? 'No one is banned for the moment' : ''}
      <List>
        {banList.map((u: User) => (
          <ListItemButton key={u.id} onClick={() => setSelectedUser(u)}>
            {selectedUser?.id === u.id ? <Unban banList={banList} activeChannel={activeChannel} user={u} /> : ''}
            <ListItemIcon>
              <Avatar alt={u.username} src={u.avatar} />
            </ListItemIcon>
            <ListItemText primary={u.username}>{u.username}</ListItemText>
            <ListItemText secondary="offline"></ListItemText>
          </ListItemButton>
        ))}
      </List>
      <InviteToChannel activeChannel={activeChannel} userList={userList} isBanned={isBanned} isMember={isMember} />
    </div>
  );
};

export default ChannelAdminFeatures;
