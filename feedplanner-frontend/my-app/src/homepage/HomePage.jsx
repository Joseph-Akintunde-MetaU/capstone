/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useNavigate } from 'react-router-dom'
import './HomePage.css'
import { useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress';
import { FeaturedRecipeList } from './featuredRecipeList'
export function HomePage({isSignedOut, darkMode}){
    const apiKey = process.env.REACT_APP_API_KEY
    const username = localStorage.getItem("username")
    const [featuredRecipes, setFeaturedRecipes] = useState([])
    const [loading, setLoading] = useState(true)
    const [trivia, setTrivia] = useState('')
    const [currentTime, setCurrentTime] = useState(new Date())
    const nav = useNavigate()
    async function HomePageRecipes(){
        try{
        const response = await fetch(`https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=6`)
        const data = await response.json()
        setFeaturedRecipes(data.recipes)
        }catch(error){
            console.error(error)
        }finally{
            setLoading(false)
        }
    }

   function getGreeting() {
        const hour = currentTime.getHours()
        if (hour < 12) return "Good Morning"
        if (hour < 17) return "Good Afternoon"
        return "Good Evening"
    }

    async function FoodTrivia(){
        try{
            const response = await fetch(`https://api.spoonacular.com/food/trivia/random?apiKey=${apiKey}`)
            const data = await response.json()
            setTrivia(data)
        }catch(error){
            console.error(error)
        }
    }
    useEffect(() => {
        HomePageRecipes()
        FoodTrivia()
        const timer = setInterval(() => {
            setCurrentTime(new Date())
        }, 60000)

        return () => clearInterval(timer)
    },[])
    return(
        <div className='homeWrap'>
            <main className='mainContent'>
                <section className='greeting'>
                    <div className="greeting-time">{getGreeting()}, {username}!</div>
                    <h2>Welcome to FeedPlanner!</h2>
                    <p>DISH DISCOVERY</p>
                    <span>FEATURED RECIPES OF THE DAY</span>
                    <button className="refresh-btn" onClick={HomePageRecipes} disabled={loading}>
                        {loading ? <CircularProgress/> : <img style = {{width:"30px"}}src='https://img.icons8.com/?size=100&id=33936&format=png&color=000000'/>}
                    </button>
                </section>
                <section className='featuredRecipes'>
                    {loading ? (<div className='loader'><CircularProgress color = "success"/> <br />Loading..</div>) : 
                    (<div className='recipeCards'><FeaturedRecipeList featuredRecipes = {featuredRecipes} HomePageRecipes = {HomePageRecipes} darkMode={darkMode}/></div>)}
                </section>
            <div className='pantryAdder'>
                    <button onClick={() => nav("/pantry")}>
                        <div className="pantry-icon"><img src="https://img.icons8.com/?size=100&id=9r0gko6LsK2R&format=png&color=000000" alt="" /></div>
                        <div className="pantry-text">
                            <strong>PANTRY MANAGER</strong>
                            <span>your go-to pantry handler</span>
                        </div>
                        <div className="pantry-arrow">→</div>
                    </button>
            </div>
            <div>
                <section>
                    <div>
                        {trivia && trivia.text ? (
                            <div className="food-trivia">
                                <h3>Food Trivia</h3>
                                <p>{trivia.text}</p>
                            </div>
                        ) : null}
                    </div>
                </section>
            </div>
            </main>
            <footer className="Footer">
                <p>
                &copy; The 2AJ Food and Waste Prevention Company LLC 2030. All Rights
                Reserved
                </p>
                <div className="socials">
                    <a href="https://www.instagram.com/jausephh/?hl=en">
                        <img
                        width="50px"
                        src={darkMode ? "img/hd-square-white-instagram-logo-icon-png-701751695118869dhkjddwaed.png" : "img/instagram.png"}
                        alt="instagram"
                        />
                    </a>
                    <a href="mailto:jakintunde@claflin.edu">
                        <img
                        width="50px"
                        src="img/mail.jpg"
                        alt="mail"
                        />
                    </a>
                    <a href="https://www.linkedin.com/in/joseph-akintunde-4a1492288/">
                        <img
                        width="40px"
                        src={darkMode ? "img/white-in.png" : "img/linkedin.png"}
                        alt="linkedin"
                        />
                    </a>
                    <a href="https://github.com/joseph-akintunde/flixster-starter">
                        <img 
                        className="git" 
                        width="40px" 
                        src="img/imagesgit.png" 
                        alt='github'
                        />
                    </a>
                </div>
            </footer>
        </div>
    )
}