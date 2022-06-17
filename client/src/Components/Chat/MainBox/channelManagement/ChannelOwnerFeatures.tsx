import { Button } from '@mui/material';
import React, { useContext, useState } from 'react';
import { UserContext } from '../../../../Contexts/userContext';
import Channel from '../../../../Interfaces/channel.interface';
import User from '../../../../Interfaces/user.interface';
import ChangePassword from './ownerFeatures/ChangePassword';
import ProtectedToPublic from './ownerFeatures/ProtectedToPublic';
import PublicToProtected from './ownerFeatures/PublicToProtected';
import DeleteIcon from '@mui/icons-material/Delete';
import { SocketContext } from '../../../../Contexts/socket';
import OwnerLeavesDialog from './ownerFeatures/OwnerLeavesDialog';

// OWNER CAN :
// - make access: protected -> public
// - make access: public -> protected (set password)
// - change password
// - set/unset admins

type Props = {
  activeChannel: Channel;
  adminList: User[];
  memberList: User[];
  setActiveChannel: (channel: Channel | undefined) => void;
};

const ChannelOwnerFeatures = (props: Props) => {
  const { activeChannel, adminList, setActiveChannel, memberList } = props;
  const me = useContext(UserContext).user;
  const [showOwner, setShowOwner] = useState(false);
  const sockContext = useContext(SocketContext);
  const [leaving, setLeaving] = useState<boolean>(false);
  const [heirId, setHeirId] = useState<string | undefined>();

  ////////////////////////////////////

  // DELETE CHANNEL
  const deleteChannel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    sockContext.socketChat.emit('channelDelete', { channelId: activeChannel.id });
  };

  // LEAVE CHANNEL AS OWNER
  const leaveChannelOwner = () => {
    if (memberList.length === 1) {
      sockContext.socketChat.emit('channelDelete', { channelId: activeChannel.id });
      setActiveChannel(undefined);
      return;
    }
    setLeaving(!leaving);
    return;
  };

  const heirSelection = () => {
    sockContext.socketChat.emit('newOwner', { channelId: activeChannel.id, heirId: heirId });
    sockContext.socketChat.emit('setAdmin', { channelId: activeChannel.id, adminId: heirId });
    sockContext.socketChat.emit('unAdmin', { channelId: activeChannel.id, adminId: me.id });
    sockContext.socketChat.emit('removeMember', { channelId: activeChannel.id, memberId: me.id });
    setActiveChannel(undefined);
  };

  return (
    <div>
      {/* SHOW OWNER FEATURES */}
      <h3>{'Owner section'}</h3>
      {activeChannel.access === 'public' ? <PublicToProtected activeChannel={activeChannel} setActiveChannel={setActiveChannel} /> : ''}
      {activeChannel.access === 'protected' ? (
        <div>
          <ProtectedToPublic activeChannel={activeChannel} setActiveChannel={setActiveChannel} />
          <ChangePassword activeChannel={activeChannel} setActiveChannel={setActiveChannel} />
        </div>
      ) : (
        ''
      )}
      <Button variant="outlined" onClick={deleteChannel} startIcon={<DeleteIcon />} color="error" sx={{ marginTop: '20px' }}>
        Delete this channel
      </Button>
      <Button variant="outlined" color="error" sx={{ marginTop: '20px' }} onClick={leaveChannelOwner}>
        Leave
      </Button>
      <OwnerLeavesDialog memberList={memberList} leaving={leaving} setLeaving={setLeaving} heirSelection={heirSelection} heirId={heirId} setHeirId={setHeirId} />
    </div>
  );
};

export default ChannelOwnerFeatures;
