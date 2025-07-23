import { RecipeCard } from "./RecipeCard"
export function RecipeList({recipes, recipeIngredients}){
    return( recipes.map((recipe) => (
            <RecipeCard key = {recipe.id} id = {recipe.id} name = {recipe.name} score = {recipe.finalScore.toFixed(2)} image = {recipe.image} ingredients = {recipeIngredients[recipe.id]}/>
        ))
    )
}