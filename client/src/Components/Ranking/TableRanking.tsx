import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { UserRanking } from '../../pages/Ranking.pages';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

type Props = {
  ranking: UserRanking[];
};

const TableRanking = (props: Props) => {
  let navigate = useNavigate();
  function handleMatchHistory(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    navigate(`/history/${e.currentTarget.value}`);
  }

  return (
    <TableContainer component={Paper}>
      <Table sx={{ minWidth: 800 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Username</TableCell>
            <TableCell align="right">Win</TableCell>
            <TableCell align="right">Defeat</TableCell>
            <TableCell align="right">Elo</TableCell>
            <TableCell align="right">Match History</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.ranking.map((row, i) => (
            <TableRow key={row.user.username} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              <TableCell component="th" scope="row">
                {i + 1} {row.user.username}
              </TableCell>
              <TableCell align="right">{row.win}</TableCell>
              <TableCell align="right">{row.defeat}</TableCell>
              <TableCell align="right">{row.rank}</TableCell>
              <TableCell align="right">
                <Button value={row.user.id} onClick={handleMatchHistory}>
                  Match History
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default TableRanking;
