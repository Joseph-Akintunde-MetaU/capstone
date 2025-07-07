import { RecipeCard } from "./RecipeCard"
export function RecipeList({recipes}){
    return( recipes.map((recipe) => (
            <RecipeCard id = {recipe.id} title = {recipe.title} image = {recipe.image} duration = {recipe.likes}/>
        ))
    )
}