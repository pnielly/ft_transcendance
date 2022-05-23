import { useContext } from 'react';
import { UserContext } from '../../Contexts/userContext';
import Channel from '../Interfaces/channel.interface';
import User from '../Interfaces/user.interface';
import Ban from './adminFeatures/ban';
import InviteToChannel from './adminFeatures/inviteToChannel';
import Mute from './adminFeatures/mute';
import Unban from './adminFeatures/unban';
import Unmute from './adminFeatures/unmute';

type Props = {
  activeChannel: Channel;
  adminList: User[];
  memberList: User[];
  banList: User[];
  muteList: User[];
  userList: User[];
};

// ADMIN CAN :
// - ban users (WIP)
// - mute users for a limited time (TODO)
// - add users (useful if the channel is private) (TODO)

// NOTE: You can't ban an admin

const ChannelAdminFeatures = (props: Props) => {
  const { activeChannel, adminList, memberList, banList, muteList, userList } = props;
  const me = useContext(UserContext).user

  // isAdmin(): is this member an admin?
  function isAdmin(user: User) {
    let res: boolean = false;
    adminList.map((e) => (e.id === user.id ? (res = true) : null));
    return res;
  }

  // isBanned(): is this member banned ?
  function isBanned(user: User) {
    let res: boolean = false;
    banList.map((e) => (e.id === user.id ? (res = true) : null));
    return res;
  }

  // IsMember(): is this user a member ?
  function isMember(user: User) {
    let res: boolean = false;
    memberList.map((e) => (e.id === user.id ? (res = true) : null));
    return res;
  }

  return (
    <div>
      {isAdmin(me) ? (
        <div>
          <h3>{'Admin Section'}</h3>
          <Ban memberList={memberList} activeChannel={activeChannel} isAdmin={isAdmin} />
          <Unban banList={banList} activeChannel={activeChannel} />
          <Mute memberList={memberList} activeChannel={activeChannel} isAdmin={isAdmin} />
          <Unmute muteList={muteList} activeChannel={activeChannel} />
          <InviteToChannel activeChannel={activeChannel} userList={userList} isBanned={isBanned} isMember={isMember} />
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default ChannelAdminFeatures;
