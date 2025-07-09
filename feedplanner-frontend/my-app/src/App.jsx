import { Routes, Route, useNavigate, useLocation} from 'react-router-dom'
import './App.css'
import { UserAuthPage } from './authenticationpage/UserAuthPage'
import { auth } from './config/firebase.config'
import { onAuthStateChanged, signOut } from 'firebase/auth'
import { HomePage } from './homepage/HomePage'
import { ErrorPage } from './homepage/ErrorPage'
import { PantryManager } from './pantry/PantryManager'
import { RecipePage } from './recipe/recipePage'
import { MealPlannerPage } from './mealplanner/MealPlannerPage'
import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { ProfilePage } from './homepage/ProfilePage'
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
    function handleProfileClick(){
      nav("/profile")
    }
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user)
    })
    return () => unsubscribe()
  },[])
  return (
    <div className='home'>
      {location.pathname !== '/' && <header className='header'>
                <nav className='nav-bar'>
                  <img style = {{cursor: "pointer", padding: "0"}} onClick = {handleImageClick} className = 'nav-fp-logo'  src="img/logo4.png" alt="2025 FeedPlanner &copy;" />
                  <div className='links'> 
                    <a onClick={handleImageClick}>HOME</a>
                    <a onClick={handleRecipeClick}>RECIPES</a>
                    <a onClick={handleMealPlanClick}>MEAL PLANNER</a>
                    <a onClick={handleProfileClick}>PROFILE</a>
                    <a style = {{cursor: "pointer"}}onClick={isSignedOut}>LOGOUT</a>
                    <button onClick={toggleDarkMode}>
                  {darkMode ? <img src = "https://img.icons8.com/?size=100&id=q4yXFoEnYRH7&format=png&color=000000"/> : <img src = "https://img.icons8.com/?size=100&id=45475&format=png&color=000000"/>}
                </button>
                  </div>
                </nav>
                
        </header>}
      <Routes>
        <Route path='/' element={<UserAuthPage />} />
        <Route path='/home' element={ isAuthenticated === false ? <Navigate to="/"/> : <HomePage isSignedOut={isSignedOut}/>} />
        <Route path='/errorpage' element={ isAuthenticated === false ? <Navigate to="/"/> : <ErrorPage/>} />
        <Route path='/pantry' element = {isAuthenticated === false ? <Navigate to="/"/> : <PantryManager/>}/>
        <Route path = "/recipes" element = {isAuthenticated === false ? <Navigate to="/"/> : <RecipePage/>}/>
        <Route path='/mealplanner' element = {isAuthenticated === false ? <Navigate to="/"/> : <MealPlannerPage/>}/>
        <Route path='/profile' element = {isAuthenticated === false ? <Navigate to = "/"/> : <ProfilePage isSignedOut={isSignedOut}/>}/>
      </Routes>
    </div>
  );
}

export default App;
