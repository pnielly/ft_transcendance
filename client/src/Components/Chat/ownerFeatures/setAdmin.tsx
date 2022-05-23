import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import { UserContext } from '../../../Contexts/userContext';
import Channel from '../../Interfaces/channel.interface';
import User from '../../Interfaces/user.interface';

type Props = {
  activeChannel: Channel;
  memberList: User[];
  adminList: User[];
};

const SetAdmin = (props: Props) => {
  const { memberList, adminList, activeChannel } = props;
  const me = useContext(UserContext).user;
  const sockContext = useContext(SocketContext);
  const [toAdmin, setToAdmin] = useState<number>(); // used to select member to set admin

  // isAdmin(): is this member an admin?
  function isAdmin(user: User) {
    let res: boolean = false;
    adminList.map((e) => (e.id === user.id ? (res = true) : null));
    return res;
  }

  // SET NEW ADMIN TO ROOM
  const setUserAdmin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    sockContext.socketChat.emit('setAdmin', { channelId: activeChannel.id, adminId: toAdmin });
  };

  return (
    <div>
      {'memberList'}
      <ul>
        {memberList.map((user) => (
          <li key={user.id}>{user.username}</li>
        ))}
      </ul>
      {/* let the owner grant administrator rights to other users */}
      <button type="submit" onClick={setUserAdmin}>
        nommer administrateur
      </button>
      <select id="admin" defaultValue={me.id} onChange={(e) => setToAdmin(Number(e.currentTarget.value))}>
        {memberList.map((user) =>
          !isAdmin(user) ? (
            <option value={user.id} key={user.id}>
              {user.username}
            </option>
          ) : (
            ''
          )
        )}
      </select>
    </div>
  );
};

export default SetAdmin;
