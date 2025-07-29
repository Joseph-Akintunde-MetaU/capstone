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
import { FavoritePage } from './favorites/FavoritePage'
import NotificationCenter from './notifications/NotificationCenter'
import { ToastContainer } from 'react-toastify'
import AddExpiringToGroceryList from './homepage/AddExpiringToGroceryList'
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
    function handleFavoriteClick(){
      nav("/favorites")
    }
  const [isAuthenticated, setIsAuthenticated] = useState(null)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user)
    })
    return () => unsubscribe()
  },[])
  const [recipes, setRecipes] = useState ([]);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [openGroceryList, setOpenGroceryList] = useState(false);
  const [pantry, setPantry] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [scoredRecipes, setScoredRecipes] = useState([]);
  const [recipeIngredients, setRecipeIngredients] = useState({});
  const [favoritedRecipeCards, setFavoritedRecipeCards] = useState([])
  const [mealPlans, setMealPlans] = useState([])
  const unreadCount = notifications.filter((n) => !n.read).length
  const expiredCount = notifications.filter((notif) => notif.type === "expired").length
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
                  {darkMode ? <img src = "https://img.icons8.com/?size=100&id=H3yHeysB1dxv&format=png&color=000000"/> : <img src = "https://img.icons8.com/?size=100&id=45475&format=png&color=000000"/>}
                </button>
                <button onClick={handleFavoriteClick}>
                  {darkMode ? <img src = "https://img.icons8.com/?size=100&id=36g5wgnLThGl&format=png&color=000000"/> : <img src = "https://img.icons8.com/?size=100&id=112373&format=png&color=000000"/> }
                </button>
                <button onClick={() => setOpenNotifications(true)}><img src="https://img.icons8.com/?size=100&id=11642&format=png&color=000000" alt="" />{unreadCount > 0 ? <span>{unreadCount}</span> : ''}</button>
                <button onClick={() => setOpenGroceryList(true)}><img src="https://img.icons8.com/?size=100&id=Ot2P5D5MPltM&format=png&color=000000" alt=""/>{expiredCount > 0 ? <span>{expiredCount}</span> : ''}</button>
                  </div>
                </nav>
                
        </header>}
      <Routes>
        <Route path='/' element={<UserAuthPage />} />
        <Route path='/home' element={ isAuthenticated === false ? <Navigate to="/"/> : <HomePage isSignedOut={isSignedOut}/>} />
        <Route path='/errorpage' element={ isAuthenticated === false ? <Navigate to="/"/> : <ErrorPage/>} />
        <Route path='/pantry' element = {isAuthenticated === false ? <Navigate to="/"/> : <PantryManager pantry={pantry} setPantry={setPantry}/>}/>
        <Route path = '/recipes' element = {isAuthenticated === false ? <Navigate to="/"/> : <RecipePage recipes = {recipes} setRecipes={setRecipes} scoredRecipes={scoredRecipes} setScoredRecipes={setScoredRecipes} recipeIngredients={recipeIngredients} setRecipeIngredients={setRecipeIngredients} favoriteRecipes={favoritedRecipeCards}/>}/>
        <Route path='/mealplanner' element = {isAuthenticated === false ? <Navigate to="/"/> : <MealPlannerPage mealPlans={mealPlans} setMealPlans={setMealPlans}/>}/>
        <Route path='/profile' element = {isAuthenticated === false ? <Navigate to = "/"/> : <ProfilePage isSignedOut={isSignedOut} darkMode={darkMode} toggleDarkMode={toggleDarkMode}/>}/>
        <Route path='/favorites' element = {isAuthenticated === false ? <Navigate to = "/"/> : <FavoritePage scoredRecipes={scoredRecipes} recipeIngredients={recipeIngredients} setRecipeIngredients={setRecipeIngredients} favoritedRecipeCards={favoritedRecipeCards} setFavoritedRecipeCards={setFavoritedRecipeCards}/>}/>
      </Routes>
      <NotificationCenter openDrawer={openNotifications} setOpenDrawer={setOpenNotifications} notifications={notifications} setNotifications={setNotifications}/>
      <AddExpiringToGroceryList openDrawer={openGroceryList} setOpenDrawer={setOpenGroceryList}/>
      <ToastContainer position='top-right' autoClose = {5000} closeOnClick pauseOnHover draggable hideProgressBar = {false} theme = {darkMode ? "dark":"light"}/>
    </div>
  );
}

export default App;
