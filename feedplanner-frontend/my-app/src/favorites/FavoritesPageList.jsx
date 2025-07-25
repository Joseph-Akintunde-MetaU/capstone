import { FavoritePageCards } from "./FavoritePageCards"

export default function FavoritePageList({recipes, recipeIngredients}){
    return(
        recipes.map((recipe) => 
            <FavoritePageCards id = {recipe.id} image = {recipe.image} title = {recipe.title} ingredients={recipeIngredients[recipe.id]}/>
        )
    )
}