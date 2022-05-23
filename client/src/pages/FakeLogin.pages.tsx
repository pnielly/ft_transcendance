import { FormEvent, useContext, useState } from 'react';
import { UserContext } from '../Contexts/userContext';
import axios from 'axios';

const FakeLogin = () => {
  const userContext = useContext(UserContext);
  const [input, setInput] = useState<string>('');

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
        window.location.replace('http://localhost:3000/chat');
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
