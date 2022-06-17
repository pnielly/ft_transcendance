import { useEffect } from 'react';

export default function Login42() {
  let url = process.env.REACT_APP_REDIRECT_42_LOGIN;

  useEffect(() => {
    if (url) window.location.replace(url);
  }, [url]);
  return <div></div>;
}
