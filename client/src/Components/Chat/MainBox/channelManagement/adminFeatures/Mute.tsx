import React, { useContext, useState } from 'react';
import { SocketContext } from '../../../../../Contexts/socket';
import { Button } from '@mui/material';
import Box from '@mui/material/Box';
import Slider from '@mui/material/Slider';
import Channel from '../../../../../Interfaces/channel.interface';
import User from '../../../../../Interfaces/user.interface';

const DEFAULT_VALUE = 25;

type Props = {
  activeChannel: Channel;
  isAdmin: (user: User) => boolean;
  isMute: (user: User) => boolean;
  user: User;
  setMuteTime: (time: number) => void;
  muteTime: number;
};

const Mute = (props: Props) => {
  const { activeChannel, isAdmin, isMute, user, setMuteTime, muteTime } = props;
  const sockContext = useContext(SocketContext);
  const [value, setValue] = useState<number>(DEFAULT_VALUE);



  // MUTE A MEMBER //////////////////////////////////////////////////
  const muteMember = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    let time = 15000;
    // setMuteTime
    switch (value) {
      case 0:
        time = 15000;
        break;
      case 25:
        time = 300000;
        break;
      case 50:
        time = 1800000;
        break;
      case 75:
        time = 3600000;
        break;
      case 100:
        time = 36000000;
        break;
    }
    setMuteTime(time)
    // add to muteList
    sockContext.socketChat.emit('addMute', { channelId: activeChannel.id, userId: user.id, muteTime: time });
    setValue(DEFAULT_VALUE)
  };

  const marks = [
    {
      value: 0,
      label: '15s'
    },
    {
      value: 25,
      label: '5m'
    },
    {
      value: 50,
      label: '30m'
    },
    {
      value: 75,
      label: '1h'
    },
    {
      value: 100,
      label: '10h'
    }
  ];

  const handleChange = (event: Event, newValue: number | number[]) => {
    setValue(newValue as number);
  };

  return (
    <div>
      {!isAdmin(user) && !isMute(user) ? (
        <div>
          <Box sx={{ width: 300 }}>
            <Slider aria-label="Custom marks" defaultValue={DEFAULT_VALUE} step={25} marks={marks} onChange={handleChange} />
          </Box>
          <Button color="warning" onClick={muteMember}>
            {'mute'}
          </Button>
        </div>
      ) : (
        ''
      )}
    </div>
  );
};

export default Mute;
