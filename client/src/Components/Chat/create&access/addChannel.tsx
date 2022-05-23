import { useContext, useState } from 'react';
import { SocketContext } from '../../../Contexts/socket';
import { UserContext } from '../../../Contexts/userContext';

type Props = {
  openForm: boolean;
};

const AddChannelForm = (props: Props) => {
  const { openForm } = props;
  const [channelName, setChannelName] = useState<string>('');
  const [channelAccess, setChannelAccess] = useState<string>('public');
  const [showPasswordInput, setShowPasswordInput] = useState<boolean>(false);
  const [password, setPassword] = useState<string>('');
  const me = useContext(UserContext).user;
  const sockContext = useContext(SocketContext);

  // CHANNEL CREATION //////////////////////////////////////////
  function handleNameTyping(e: React.FormEvent<HTMLInputElement>) {
    setChannelName(e.currentTarget.value);
  }

  const updateAccess = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setChannelAccess(e.target.value);
    if (e.target.value === 'protected') {
      setShowPasswordInput(true);
    } else {
      setShowPasswordInput(false);
    }
  };

  function handlePasswordTyping(e: React.FormEvent<HTMLInputElement>) {
    setPassword(e.currentTarget.value);
  }

  function sendChannel(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    sockContext.socketChat.emit('createChatRoom', { name: channelName, access: channelAccess, password: password, userId: me.id });
    setChannelName('');
    setPassword('');
  }
  ////////////////////////////////////////////////////////////////////////////

  if (openForm) {
    return (
      <form>
        {/* create new room */}
        <input type="text" onChange={handleNameTyping} value={channelName} placeholder="Nom Channel" />
        <select id="access" onChange={updateAccess} defaultValue="public">
          <option value="public">public</option>
          <option value="private">private</option>
          <option value="protected">protected</option>
        </select>
        {/* display password input or not (for room creation)*/}
        {showPasswordInput ? <input type="password" onChange={handlePasswordTyping} value={password} placeholder="Tapez votre mot de passe" minLength={1} /> : ''}
        {/* submit */}
        <button type="submit" onClick={sendChannel}>
          Create a room
        </button>
      </form>
    );
  }
  return <></>;
};
export default AddChannelForm;