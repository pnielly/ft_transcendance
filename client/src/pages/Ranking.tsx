import { Grid, Container } from '@mui/material';
import axios from 'axios';
import { useState } from 'react';
import { useEffect } from 'react';
import User from '../Interfaces/user.interface';
import TableRanking from '../Components/Game/Ranking/TableRanking';
import '../CSS/rainbow.css';

export interface UserRanking {
  id: string;
  rank: number;
  win: number;
  defeat: number;
  user: User;
  points: number;
}

const Ranking = () => {
  const [ranking, setRanking] = useState<UserRanking[]>([]);
  useEffect(() => {
    axios
      .get<UserRanking[]>(`${process.env.REACT_APP_DEFAULT_URL}/ranking`, { withCredentials: true })
      .then((res) => setRanking(res.data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <Container maxWidth="xl">
      <Grid container justifyContent="center">
        <Grid item xs={12}>
          <h1 className="classic" style={{ fontSize: '3em' }}>
            General Ranking
          </h1>
        </Grid>
        <Grid item md={8}>
          <TableRanking ranking={ranking} />
        </Grid>
      </Grid>
    </Container>
  );
};

export default Ranking;
