import { Routes, Route, useNavigate, useLocation} from 'react-router-dom'
import './App.css'
import { UserAuthPage } from './authenticationpage/UserAuthPage'
import { auth } from './config/firebase.config'
import { signOut } from 'firebase/auth'
import { HomePage } from './homepage/HomePage'
import { ErrorPage } from './homepage/ErrorPage'
import { PantryManager } from './pantry/PantryManager'
import { Recipes } from './recipes/recipes'
function App() {
  const location = useLocation()
  const nav = useNavigate()
   function isSignedOut(){
        signOut(auth).then(() => {
            nav("/")
        }).catch((error) => {
            console.error(error)
        });
    }
  return (
    <div>
      {location.pathname !== '/' && <header>
                <img width= "200px" height="180px" src="img/logo3.png" alt="2025 FeedPlanner &copy;" />
                <nav>
                    <a>RECIPES</a>
                    <a>MEAL PLANNER</a>
                    <a>PROFILE</a>
                    <a style = {{cursor: "pointer"}}onClick={isSignedOut}>LOGOUT</a>
                </nav>
        </header>}
      <Routes>
        <Route path='/' element={<UserAuthPage />} />
        <Route path='/home' element={<HomePage isSignedOut={isSignedOut}/>} />
        <Route path='/errorpage' element={<ErrorPage/>} />
        <Route path='/pantry' element = {<PantryManager/>}/>
        <Route path = '/recipes' element = {<Recipes/>}/>
      </Routes>
    </div>
  );
}

export default App;
