import { FormEvent, useContext, useState } from 'react';
import { UserContext } from '../Contexts/userContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const FakeLogin = () => {
  const userContext = useContext(UserContext);
  const [input, setInput] = useState<string>('');
  let navigate = useNavigate();
  function handleChange(e: FormEvent<HTMLInputElement>) {
    setInput(e.currentTarget.value);
  }

  function handleSubmit(e: FormEvent<HTMLButtonElement>) {
    e.preventDefault();
    const data = { username: input };
    axios
      .post(`${process.env.REACT_APP_DEFAULT_URL}/auth/fakelogin`, data, { withCredentials: true })
      .then((res) => {
        userContext.setUser(res.data);
        if (res.data.isTwoFactorAuthenticationEnabled) navigate('/2fwa');
        else navigate('/game');
      })
      .catch((err) => {
        if (err.response) {
          console.log(err.response.data);
          console.log(err.response.status);
          console.log(err.response.headers);
        }
      });
  }
  return (
    <form>
      <input type="text" onChange={handleChange} value={input} placeholder="you login" />
      <button type="submit" onClick={handleSubmit}>
        Submit
      </button>
    </form>
  );
};

export default FakeLogin;
