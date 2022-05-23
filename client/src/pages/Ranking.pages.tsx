import { Grid, Typography } from '@mui/material';
import axios from 'axios';
import React, { useState } from 'react';
import { useEffect } from 'react';
import User from '../Components/Interfaces/user.interface';
import TableRanking from '../Components/Ranking/TableRanking';

export interface UserRanking {
  id: number;
  rank: number;
  win: number;
  defeat: number;
  user: User;
}

const Ranking = () => {
  const [ranking, setRanking] = useState<UserRanking[]>([]);

  useEffect(() => {
    axios
      .get<UserRanking[]>(`${process.env.REACT_APP_DEFAULT_URL}/ranking`)
      .then((res) => setRanking(res.data))
      .catch((err) => console.log(err));
  });

  return (
    <Grid container justifyContent="center" alignItems="center" direction="column">
      <Typography variant="h3">Ranking</Typography>
      <Grid item>
        <TableRanking ranking={ranking} />
      </Grid>
    </Grid>
  );
};

export default Ranking;
