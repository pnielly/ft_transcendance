import React, { useContext } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import { UserContext } from '../../../Contexts/userContext';
import Channel from '../../Interfaces/channel.interface';
import User from '../../Interfaces/user.interface';

type Props = {
  activeChannel: Channel;
  adminList: User[];
};

const AdminList = (props: Props) => {
  const { adminList, activeChannel } = props;
  const sockContext = useContext(SocketContext);
  const me = useContext(UserContext).user;

  // REMOVE ADMIN
  const removeAdmin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    sockContext.socketChat.emit('unAdmin', { channelId: activeChannel.id, adminId: Number(e.currentTarget.value) });
  };

  return (
    <div>
      {' '}
      {'Liste des administrateurs: '}
      <ul>
        {adminList?.map((a) => (
          <li key={a.id}>
            {a.username}
            {a.id === me.id ? (
              ''
            ) : (
              <button type="submit" onClick={removeAdmin}>
                remove
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AdminList;
