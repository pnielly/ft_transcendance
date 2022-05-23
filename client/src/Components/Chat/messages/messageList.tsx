import { List, ListItem, Grid, ListItemText } from '@mui/material';
import React from 'react';
import Message from '../../Interfaces/message.interface';

type Props = {
  messages: Message[];
};

const MessageList = (props: Props) => {
  const { messages } = props;
  return (
    <React.Fragment>
      <List sx={{ height: '70vh', overflowY: 'auto' }}>
        {messages?.map(({ id, content, createdAt, senderName }) => (
          <ListItem key={id}>
            <Grid container>
              <Grid item xs={12}>
                <ListItemText primary={senderName + ': ' + content}></ListItemText>
              </Grid>
              <Grid item xs={12}>
                <ListItemText secondary={createdAt.toString()}></ListItemText>
              </Grid>
            </Grid>
          </ListItem>
        ))}
      </List>
    </React.Fragment>
  );
};
export default MessageList;
