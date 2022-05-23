import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function Login42() {
  let location = useLocation();
  let from: any = location.state;
  if (!from) from = { from: { pathname: '/' } };

  let url =
    'https://api.intra.42.fr/oauth/authorize?client_id=7f08815a6af5d67244399ec67cccfeb195690999f7c9d0e7159e0f4a5385b324&redirect_uri=http%3A%2F%2Flocalhost%3A4000%2Fauth%2Fredirect&response_type=code';
  url = url + '&state=' + from.from.pathname;
  console.log(url);
  useEffect(() => {
    window.location.replace(url);
  });
  return <div></div>;
}
