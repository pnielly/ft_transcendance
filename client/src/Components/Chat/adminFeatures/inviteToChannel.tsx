import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import Channel from '../../Interfaces/channel.interface';
import User from '../../Interfaces/user.interface';

type Props = {
  activeChannel: Channel;
  userList: User[];
  isBanned: (user: User) => boolean;
  isMember: (user: User) => boolean;
};

const InviteToChannel = (props: Props) => {
  const { activeChannel, userList, isBanned, isMember } = props;
  const sockContext = useContext(SocketContext);
  const [toInvite, setToInvite] = useState<number>(); // used to select member to invite

  // INVITE USER TO CHANNEL ////////////////////////////////////////
  const inviteToChannel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // send invite
    console.log('toInvite : ', toInvite);
    sockContext.socketChat.emit('inviteChannel', { channelId: activeChannel.id, channelName: activeChannel.name, guestId: toInvite });
  };
  return (
    <div>
      {' '}
      <h4>{'Invite users to room'}</h4>
      <button type="submit" onClick={inviteToChannel}>
        invite this user to be a member
      </button>
      <select id="inviteToChannel" defaultValue={'select'} onChange={(e) => setToInvite(Number(e.currentTarget.value))}>
        <option value={'select'} disabled hidden>
          {' '}
          -- who? --{' '}
        </option>
        {userList
          .filter((e) => !isBanned(e))
          .filter((e) => !isMember(e))
          .map((user) => (
            <option value={user.id} key={user.id}>
              {user.username}
            </option>
          ))}
      </select>
    </div>
  );
};

export default InviteToChannel;
