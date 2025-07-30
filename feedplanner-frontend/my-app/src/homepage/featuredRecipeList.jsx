import { FeaturedRecipeCard } from "./featuredRecipeCard";
export function FeaturedRecipeList({featuredRecipes, HomePageRecipes, darkMode}){
    return featuredRecipes.map((recipe) => (
                <FeaturedRecipeCard key = {recipe.id} darkMode = {darkMode} image = {recipe.image} title = {recipe.title} healthScore={recipe.healthScore} servings={recipe.servings} readyInMinutes={recipe.readyInMinutes} summary={recipe.summary} instructions={recipe.instructions} HomePageRecipes = {HomePageRecipes} ingredients={recipe.extendedIngredients.map((ingredient) => ingredient.original)}/>
    ))
}