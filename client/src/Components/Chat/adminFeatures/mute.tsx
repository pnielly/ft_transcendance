import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import Channel from '../../Interfaces/channel.interface';
import User from '../../Interfaces/user.interface';

type Props = {
  memberList: User[];
  activeChannel: Channel;
  isAdmin: (user: User) => boolean;
};

const Mute = (props: Props) => {
  const { memberList, activeChannel, isAdmin } = props;
  const sockContext = useContext(SocketContext);
  const [toMute, setToMute] = useState<number>(); // used to select member to mute
  const [muteTime, setMuteTime] = useState<number>();

  // MUTE A MEMBER //////////////////////////////////////////////////
  const muteMember = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    // add to muteList
    console.log('mute : ', toMute);
    sockContext.socketChat.emit('addMute', { channelId: activeChannel.id, muteId: toMute, muteTime: muteTime });
  };

  return (
    <div>
      <h4>{'Mute a member'}</h4>
      <button type="submit" onClick={muteMember}>
        mute this member
      </button>
      <select id="muteId" defaultValue={'select'} onChange={(e) => setToMute(Number(e.currentTarget.value))}>
        <option value={'select'} disabled hidden>
          {' '}
          -- who? --{' '}
        </option>
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
      <select id="muteTime" defaultValue={'select'} onChange={(e) => setMuteTime(Number(e.currentTarget.value))}>
        <option value={'select'} disabled hidden>
          {' '}
          -- for how long? --{' '}
        </option>
        {/* value = time in milliseconds */}
        <option value={3000} key="1">
          {'3 seconds'}
        </option>
        <option value={30000} key="2">
          {'30 seconds'}
        </option>
        <option value={300000} key="3">
          {'5 minutes'}
        </option>
        <option value={3600000} key="4">
          {'1 hour'}
        </option>
      </select>
    </div>
  );
};

export default Mute;
