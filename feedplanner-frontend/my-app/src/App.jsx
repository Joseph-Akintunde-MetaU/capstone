import { Routes, Route, useNavigate, useLocation} from 'react-router-dom'
import './App.css'
import { UserAuthPage } from './authenticationpage/UserAuthPage'
import { auth } from './config/firebase.config'
import { signOut } from 'firebase/auth'
import { HomePage } from './homepage/HomePage'
import { ErrorPage } from './homepage/ErrorPage'
import { PantryManager } from './pantry/PantryManager'
import { RecipePage } from './recipe/recipePage'
import { MealPlannerPage } from './mealplanner/MealPlannerPage'
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
    function handleImageClick(){
      nav("/home")
    }
    function handleRecipeClick(){
      nav("/recipes")
    }
  return (
    <div >
      {location.pathname !== '/' && <header className='header'>
                <img style = {{cursor: "pointer", padding: "0"}} onClick = {handleImageClick} className = 'nav-fp-logo'  src="img/logo4.png" alt="2025 FeedPlanner &copy;" />
                <nav className='links'>
                    <a onClick={handleRecipeClick}>RECIPES</a>
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
        <Route path = '/recipes' element = {<RecipePage/>}/>
        <Route path='/mealplanner' element = {<MealPlannerPage/>}/>
      </Routes>
    </div>
  );
}

export default App;
