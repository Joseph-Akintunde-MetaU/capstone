import { featuredRecipe } from "../utility/featuredRecipe";
import { FeaturedRecipeCard } from "./featuredRecipeCard";
export function FeaturedRecipeList({featuredRecipes, HomePageRecipes}){
    return featuredRecipes.map((recipe) => (
                <FeaturedRecipeCard image = {recipe.image} title = {recipe.title} duration = {recipe.duration} HomePageRecipes = {HomePageRecipes}/>
    ))
}