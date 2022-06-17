import { FormEvent, useContext, useState } from 'react';
import { SocketContext } from '../../Contexts/socket';

type Props = {
  onLoginSubmit: (login: string) => void;
};

const Login = (props: Props) => {
  const [newInput, setNewInput] = useState<string>('');
  const sockContext = useContext(SocketContext);

  function handleChange(e: FormEvent<HTMLInputElement>) {
    setNewInput(e.currentTarget.value);
  }

  function saveLogin(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault();
    sockContext.socketChat.emit('loginToServer', { login: newInput, id: sockContext.socketChat.id });
    props.onLoginSubmit(newInput);
  }

  const title = "What's your login?";
  return (
    <div>
      <h1>{title}</h1>
      <form>
        <input type="text" onChange={handleChange} value={newInput} placeholder="your login" />
        <button type="submit" onClick={saveLogin}>
          Save
        </button>
      </form>
    </div>
  );
};
export default Login;
