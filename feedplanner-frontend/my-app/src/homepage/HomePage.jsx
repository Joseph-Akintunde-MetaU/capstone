/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import { useNavigate } from 'react-router-dom'
import './HomePage.css'
import { useEffect, useState } from 'react'
import { FeaturedRecipeList } from './featuredRecipeList'
// eslint-disable-next-line no-unused-vars
export function HomePage({isSignedOut}){
    const apiKey = `99ef92bd289d40adad70faaf03409ec2`
    const email = localStorage.getItem("email")
    const [featuredRecipes, setFeaturedRecipes] = useState([])
    const nav = useNavigate()
    const apiKey = `99ef92bd289d40adad70faaf03409ec2`
    async function HomePageRecipes(){
        const response = await fetch(`https://api.spoonacular.com/recipes/random?apiKey=${apiKey}&number=3`)
        const data = await response.json()
        setFeaturedRecipes(data.recipes)
    }
    useEffect(() => {
        HomePageRecipes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])
    return(
        <div>
            <section>
                <p>Welcome {email ? email : nav('/errorpage')}</p>
                <h2>DISH DISCOVERY</h2>
                <div>
                    <h3>FEATURED RECIPES OF THE DAY</h3>
                </div>
            </section>
            <div className='pantryAdder'>
                <button onClick={() => nav("/pantry")}>PANTRY MANAGER <br/>your go-to pantry handler</button>
            </div>
            <section className='featuredRecipes'>
                <FeaturedRecipeList featuredRecipes = {featuredRecipes} HomePageRecipes = {HomePageRecipes} />
            </section>
        </div>
    )
}