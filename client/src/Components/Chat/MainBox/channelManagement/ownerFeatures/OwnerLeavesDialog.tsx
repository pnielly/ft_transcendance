import { ButtonGroup } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import { TransitionProps } from '@mui/material/transitions';
import React, { useContext } from 'react';
import { UserContext } from '../../../../../Contexts/userContext';
import User from '../../../../../Interfaces/user.interface';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {
    children: React.ReactElement<any, any>;
  },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

type Props = {
  leaving: boolean;
  setLeaving: (open: boolean) => void;
  heirSelection: (e: any) => void;
  heirId: string | undefined;
  setHeirId: (heirId: string) => void;
  memberList: User[];
};

const OwnerLeavesDialog = (props: Props) => {
  const { leaving, setLeaving, heirSelection, heirId, setHeirId, memberList } = props;
  const me = useContext(UserContext).user;

  const isActive = (value: string): 'contained' | 'outlined' => {
    if (value === heirId) return 'contained';
    return 'outlined';
  };

  const DialogButton = (props: { value: string; name: string }) => (
    <Button
      variant={isActive(props.value)}
      sx={{ width: '100%' }}
      onClick={() => {
        setHeirId(props.value);
      }}
      value={props.value}
    >
      {props.name}
    </Button>
  );

  return (
    <div>
      <Dialog open={leaving} TransitionComponent={Transition} keepMounted onClose={() => setLeaving(false)} aria-describedby="alert-dialog-slide-description">
        <DialogTitle>{'Choose your heir:'}</DialogTitle>
        <DialogContent>
          <ButtonGroup aria-label="outlined primary button group">{memberList.map((u: User, i) => (u.id === me.id ? '' : <DialogButton key={i} value={u.id} name={u.username} />))}</ButtonGroup>
        </DialogContent>
        <DialogActions>
          <Button onClick={heirSelection}>Send</Button>
          <Button onClick={() => setLeaving(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default OwnerLeavesDialog;
