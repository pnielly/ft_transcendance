import { List, ListItem, Grid, ListItemText, Typography } from '@mui/material';
import React, { useRef, useEffect, useContext, useState, useCallback } from 'react';
import Message from '../../../../Interfaces/message.interface';
import ReactTimeAgo from 'react-time-ago';
import { UserContext } from '../../../../Contexts/userContext';
import axios from 'axios';
import { SocketContext } from '../../../../Contexts/socket';
import User from '../../../../Interfaces/user.interface';

type Props = {
  messageList: Message[];
};

const MessageList = (props: Props) => {
  const { messageList } = props;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const me = useContext(UserContext).user;
  const [blockList, setBlockList] = useState<User[]>([]);
  const sockContext = useContext(SocketContext);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView();
    }
  };

  useEffect(scrollToBottom, [messageList]);

  ///////////////////// UPDATE BLOCKLIST ////////////////////////
  // update blockList
  const updateBlockList = useCallback(() => {
    axios
      .get(`${process.env.REACT_APP_DEFAULT_URL}/users/${me.id}/get_blocked`, { withCredentials: true })
      .then((res) => {
        setBlockList(res.data);
      })
      .catch((err) => console.log(err));
  }, [me]);

  // update blockList on start
  useEffect(() => {
    updateBlockList();
  }, []);

  // update blockList on change
  useEffect(() => {
    sockContext.socketChat.on('updateBlockList', updateBlockList);
    return () => {
      sockContext.socketChat.off('updateBlockList', updateBlockList);
    };
  }, []);

  function isBlocked(senderName: string) {
    let ret: boolean = false;
    blockList.map((u: User) => (u.username === senderName ? (ret = true) : null));
    return ret;
  }
  /////////////////////////////////////////////////////////////

  return (
    <React.Fragment>
      <h3>{'Messages Section'}</h3>
      {/* <List sx={{ height: '70vh', overflowY: 'auto' }}> */}
      {messageList?.map(({ id, content, createdAt, senderName }) => (
        <Grid container key={id}>
          <Grid item xs={12} alignItems={senderName === me.username ? 'flex-start' : 'flex-end'}>
            <p style={{ fontWeight: '800', display: 'inline-block', marginRight: '20px' }}>{senderName}</p>
            <ReactTimeAgo className="date" date={new Date(createdAt)} locale="en-US" style={{ fontSize: '10px', fontWeight: 'lighter' }} />
            {!isBlocked(senderName) ? <p style={{ marginTop: '-10px', fontWeight: '200' }}>{content}</p> : <p style={{ marginTop: '-10px', fontWeight: '200' }}>{'<user blocked>'}</p>}
          </Grid>
        </Grid>
      ))}
      <div ref={messagesEndRef} />
    </React.Fragment>
  );
};
export default MessageList;
