import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Weather from './weather'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
 <Weather/>
    </>
  )
}

export default App
