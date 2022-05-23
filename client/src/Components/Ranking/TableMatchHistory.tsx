import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import React, { useState } from 'react';
import User from '../Interfaces/user.interface';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Grid, Typography } from '@mui/material';

interface MatchHistory {
  id: number;
  score1: number;
  score2: number;
  winner: number;
  createdAt: Date;
  player1: User;
  player2: User;
}

type Props = {
  userId: string | undefined;
  status: 'ladder' | 'friendly';
};

const TableMatchHistory = (props: Props) => {
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  let { userId } = useParams();

  useEffect(() => {
    axios
      .get<MatchHistory[]>(`${process.env.REACT_APP_DEFAULT_URL}/match/history${props.status}/${props.userId}`, { withCredentials: true })
      .then((res) => {
        setMatchHistory(res.data);
      })
      .catch((err) => console.log(err));
  }, [props]);

  return (
    <Grid container justifyContent="center">
      <Typography variant="h3" sx={{ padding: '20px' }}>
        {' '}
        Match {props.status} History
      </Typography>

      <TableContainer component={Paper} sx={{ width: '80%' }}>
        <Table sx={{ minWidth: 800 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Player1</TableCell>
              <TableCell>Player2</TableCell>
              <TableCell>Winner</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matchHistory.map((match) => (
              <TableRow key={match.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row">
                  {match.player1.username}
                </TableCell>
                <TableCell>{match.player2.username}</TableCell>
                <TableCell>{match.winner === 1 ? match.player1.username : match.player2.username}</TableCell>
                <TableCell>{match.createdAt.toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
};

export default TableMatchHistory;
