/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useNavigate } from 'react-router-dom'
import './HomePage.css'
import { useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress';
import { FeaturedRecipeList } from './featuredRecipeList'
export function HomePage({isSignedOut}){
    const apiKey = `995c9d32eea04be99d91f6c9dbe6b421`
    const username = localStorage.getItem("username")
    const [featuredRecipes, setFeaturedRecipes] = useState([])
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true)
    const nav = useNavigate()
    async function HomePageRecipes(){
        try{
        const response = await fetch(`https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=6`)
        const data = await response.json()
        setFeaturedRecipes(data.recipes)
        console.log(data.recipes)
        }catch(error){
            console.error(error)
        }finally{
            setLoading(false)
        }
    }
    async function FoodTrivia(){
        try{
            const response = await fetch(`https://api.spoonacular.com/food/trivia/random?apiKey=${apiKey}`)
            const data = await response.json()
            console.log(data)
        }catch(error){
            console.error(error)
        }
    }
    useEffect(() => {
        HomePageRecipes()
        FoodTrivia()
    },[])
    return(
        <div className='homeWrap'>
            <main className='mainContent'>
                <section className='greeting'>
                    <h2>Welcome, {username ? username : nav('/errorpage')}!</h2>
                    <p>DISH DISCOVERY</p>
                    <span>FEATURED RECIPES OF THE DAY</span>
                </section>
                <section className='featuredRecipes'>
                    {loading ? (<div className='loader'><CircularProgress color = "success"/> <br />Loading..</div>) : 
                    (<div className='recipeCards'><FeaturedRecipeList featuredRecipes = {featuredRecipes} HomePageRecipes = {HomePageRecipes}/></div>)}
                </section>
            <div className='pantryAdder'>
                <button onClick={() => nav("/pantry")}>PANTRY MANAGER <br/>your go-to pantry handler</button>
            </div> 
            </main>
        </div>
    )
}