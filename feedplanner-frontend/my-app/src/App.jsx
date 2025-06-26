import { Routes, Route, useNavigate} from 'react-router-dom'
import './App.css'
import { UserAuthPage } from './UserAuthPage'
import { auth } from './config/firebase.config'
import { signOut } from 'firebase/auth'
import { HomePage } from './HomePage'
function App() {
  const nav = useNavigate()
   function isSignedOut(){
        signOut(auth).then(() => {
            console.log("Signed out Successfully")
            nav("/")
        }).catch((error) => {
            console.error(error)
        });
    }
  return (
      <Routes>
        <Route path='/' element={<UserAuthPage />} />
        <Route path='/home' element={<HomePage isSignedOut={isSignedOut}/>} />
      </Routes>
  );
}

export default App;
