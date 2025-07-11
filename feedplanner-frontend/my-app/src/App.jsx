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
import { useEffect, useState } from 'react'
function App() {
  const [darkMode, setDarkMode] = useState(false)
  function toggleDarkMode(){
    setDarkMode((prev) => {
      const newMode = !prev;
      localStorage.setItem("darkMode", (newMode))
      return newMode;
    })
  }
  useEffect(() => {
    const mode = localStorage.getItem("darkMode")
    setDarkMode(JSON.parse(mode))
  }, [])
  useEffect(() => {
    document.body.className = darkMode ? 'dark-mode' : 'light-mode'
  })
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
    function handleMealPlanClick(){
      nav("/mealplanner")
    }
  return (
    <div className='home'>
      {location.pathname !== '/' && <header className='header'>
                <nav className='links'>
                    <img style = {{cursor: "pointer", padding: "0"}} onClick = {handleImageClick} className = 'nav-fp-logo'  src="img/logo4.png" alt="2025 FeedPlanner &copy;" />
                    <a onClick={handleRecipeClick}>RECIPES</a>
                    <a onClick={handleMealPlanClick}>MEAL PLANNER</a>
                    <a>PROFILE</a>
                    <a style = {{cursor: "pointer"}}onClick={isSignedOut}>LOGOUT</a>
                </nav>
                <button onClick={toggleDarkMode}>
                  {darkMode ? <img src = "https://img.icons8.com/?size=100&id=q4yXFoEnYRH7&format=png&color=000000"/> : <img src = "https://img.icons8.com/?size=100&id=45475&format=png&color=000000"/>}
                </button>
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
