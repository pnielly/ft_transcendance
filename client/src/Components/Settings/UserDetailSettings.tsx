import { Grid } from '@mui/material';
import axios from 'axios';
import { useEffect, useState } from 'react';
import User from '../../Interfaces/user.interface';
import SwitchDoubleAuthenticated from './SwitchDoubleAuthenticated';
import CardUser from './CardUser';

interface Stats {
  win: number;
  defeat: number;
  rank: number;
  points: number;
}

type Props = {
  selectedUser: User | undefined;
};

const UserDetailSettings = (props: Props) => {
  const { selectedUser } = props;
  const [stats, setStats] = useState<Stats | undefined>();
  const [showUser, setShowUser] = useState<boolean>(true);

  useEffect(() => {
    axios
      .get<Stats>(`${process.env.REACT_APP_DEFAULT_URL}/ranking/stats/${selectedUser?.id}`, { withCredentials: true })
      .then((res) => setStats(res.data))
      .catch((err) => console.log(err));
  }, [selectedUser]);

  return (
    <Grid container direction="column" alignItems="center" spacing={1} sx={{ borderRadius: '20px', backgroundColor: 'rgb(28, 26, 26)', width: '350px', height: '400px', marginTop: '40px' }}>
      {showUser ? <CardUser stats={stats} selectedUser={selectedUser} /> : <></>}
      <Grid item sx={{ marginTop: '20px' }}>
        <SwitchDoubleAuthenticated setShowUser={setShowUser} showUser={showUser} />
      </Grid>
    </Grid>
  );
};

export default UserDetailSettings;
