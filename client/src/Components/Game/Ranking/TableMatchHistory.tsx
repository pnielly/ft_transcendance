import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { useState, useEffect } from 'react';
import User from '../../../Interfaces/user.interface';
import { Grid } from '@mui/material';
import MatchHistory from '../../../Interfaces/matchHistory';

type Props = {
  userId: string | undefined;
  limit: number;
};

const TableMatchHistory = (props: Props) => {
  const [matchHistory, setMatchHistory] = useState<MatchHistory[]>([]);
  const { userId, limit } = props;
  
  useEffect(() => {
    axios
      .get<MatchHistory[]>(`${process.env.REACT_APP_DEFAULT_URL}/match/history/${userId}${limit ? `?limit=5` : ''}`, { withCredentials: true })
      .then((res) => {
        setMatchHistory(res.data);
      })
      .catch((err) => console.log(err));
  }, [props]);

  const whoWin = (match: MatchHistory) => {
    if (userId === match.player1.id) {
      if (match.score1 > match.score2) return 'victory';
      else return 'defeat';
    } else {
      if (match.score2 > match.score1) return 'victory';
      else return 'defeat';
    }
  };

  return (
    <Grid container>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 600 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align='center'>Player 1</TableCell>
              <TableCell align='center'>Player 2</TableCell>
              <TableCell align='center'>Score</TableCell>
              <TableCell align='center'>Result</TableCell>
              <TableCell align='center'>Status</TableCell>
              <TableCell align='center'>Mode</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {matchHistory.map((match) => (
              <TableRow key={match.id} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell align='center' component="th" scope="row">
                  {match.player1.username}
                  {/* {match.player1.id === userId ? match.player2.username : match.player1.username} */}
                </TableCell>
                <TableCell align='center'>{match.player2.username}</TableCell>
                <TableCell align='center'>{`${match.score1} : ${match.score2}`} </TableCell>
                <TableCell align='center'>{whoWin(match)}</TableCell>
                <TableCell align='center'>{match.status}</TableCell>
                <TableCell align='center'>{match.mode}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Grid>
  );
};

export default TableMatchHistory;
