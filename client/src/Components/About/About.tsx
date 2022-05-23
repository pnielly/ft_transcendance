import React from 'react'

type Props = {}

const About = (props: Props) => {
  return (
    <div>About
      <p></p>
      <button onClick={() => {
        localStorage.clear()
      }}>Click here to clean the localStorage, my friend (et n'oublie pas de rafraichir la page)</button>
      <p>Clean le localStorage supprimera toutes les données locales hébergées dans le navigateur grâce au hook useLocalStorage (voir Hook dans client/src/)</p>
    </div>
  )
}

export default About