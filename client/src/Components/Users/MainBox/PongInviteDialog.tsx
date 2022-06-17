import { ButtonGroup } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import React from 'react';


const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  sendGameInvite: (e: any) => void;
  option: string;
  setOption: (option: string) => void;
};

export default function PongInviteDialog(props: Props) {
  const { open, setOpen, sendGameInvite, option, setOption } = props;

  const isActive = (value: string): 'contained' | 'outlined' => {
    if (value === option) return 'contained';
    return 'outlined';
  };

  const DialogButton = (props: { value: string }) => (
    <Button variant={isActive(props.value)} sx={{ width: '100%' }} onClick={() => {setOption(props.value)}} value={props.value}>
      {props.value}
    </Button>
  );

  return (
    <div>
      <Dialog open={open} TransitionComponent={Transition} keepMounted onClose={() => setOpen(false)} aria-describedby="alert-dialog-slide-description">
        <DialogTitle>{'Choose your game mode !'}</DialogTitle>
        <DialogContent>
          <ButtonGroup aria-label="outlined primary button group">
            <DialogButton  value='normal'/>
            <DialogButton  value='paddle'/>
            <DialogButton  value='doubleBall'/>
          </ButtonGroup>
        </DialogContent>
        <DialogActions>
        <Button onClick={sendGameInvite}>Send</Button>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
