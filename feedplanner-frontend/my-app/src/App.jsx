import { Routes, Route, useNavigate} from 'react-router-dom'
import './App.css'
import { UserAuthPage } from './UserAuthPage'
import { auth } from './config/firebase.config'
import { signOut } from 'firebase/auth'
import { HomePage } from './HomePage'
import { ErrorPage } from './ErrorPage'
function App() {
  const nav = useNavigate()
   function isSignedOut(){
        signOut(auth).then(() => {
            nav("/")
        }).catch((error) => {
            console.error(error)
        });
    }
  return (
      <Routes>
        <Route path='/' element={<UserAuthPage />} />
        <Route path='/home' element={<HomePage isSignedOut={isSignedOut}/>} />
        <Route path='/errorpage' element={<ErrorPage/>} />
      </Routes>
  );
}

export default App;
