import React, { useState } from 'react';
import { Button } from '@mui/material';
import Channel from '../Interfaces/channel.interface';
import AddChannelForm from './create&access/addChannel';
import AccessChannel from './create&access/accessChannel';
import InviteList from './create&access/inviteList';

type Props = {
  setActiveChannel: (channel: Channel) => void;
  channelList: Channel[];
};

const ChannelList = (props: Props) => {
  const { setActiveChannel, channelList } = props;
  const [openForm, setOpenForm] = useState<boolean>(false);

  function handleOpening(e: React.MouseEvent<HTMLButtonElement>) {
    setOpenForm(!openForm);
  }

  return (
    <React.Fragment>
      <Button variant="contained" color="secondary" sx={{ margin: '10px' }} onClick={handleOpening}>
        Add channel
      </Button>
      <AddChannelForm openForm={openForm} />
      <AccessChannel setActiveChannel={setActiveChannel} channelList={channelList} />
      <InviteList setActiveChannel={setActiveChannel} />
    </React.Fragment>
  );
};

export default ChannelList;
