import { useNavigate } from 'react-router-dom'
import './HomePage.css'
import { useEffect, useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress';
import { FeaturedRecipeList } from './featuredRecipeList'
// eslint-disable-next-line no-unused-vars
export function HomePage({isSignedOut}){
    const apiKey = `09acdb4877f5429e998f19def7cd5028`
    const email = localStorage.getItem("email")
    const [featuredRecipes, setFeaturedRecipes] = useState([])
    // eslint-disable-next-line no-unused-vars
    const [loading, setLoading] = useState(true)
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
    useEffect(() => {
        HomePageRecipes()
    },[]) 
    return(
        <div className='homeWrap'>
            <main className='mainContent'>
                <section className='greeting'>
                    <h2>Welcome, {email ? email : nav('/errorpage')}!</h2>
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