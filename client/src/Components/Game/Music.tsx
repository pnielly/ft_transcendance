import { Button, IconButton } from '@mui/material';
import VolumeMuteIcon from '@mui/icons-material/VolumeMute';
import VolumeUpIcon from '@mui/icons-material/VolumeUp';
import { useState } from 'react';
const ReactHowler = require('react-howler');
const Ozone = require('./ozone.mp3')

type Props = {};

const Music = (props: Props) => {
  const [play, setPlay] = useState<boolean>(true);

  return (
    <div className='neon'>
        <ReactHowler src={Ozone} playing={play} />
      <IconButton onClick={() => setPlay(!play)}>{!play ? <VolumeMuteIcon /> : <VolumeUpIcon />}</IconButton>
    </div>
  );
};

export default Music;
