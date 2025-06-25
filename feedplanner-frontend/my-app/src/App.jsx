import { BrowserRouter,Router,Route } from 'react-router-dom'
import './App.css'
import { UserAuthPage } from './UserAuthPage'

function App() {

  return (
    <>
      <BrowserRouter>
      <div>
        <UserAuthPage/>
      </div>
      </BrowserRouter>
    </>
  )
}

export default App
