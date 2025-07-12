import { FavoritePageCards } from "./FavoritePageCards"

export default function FavoritePageList({recipes}){
    return(
        recipes.map((recipe) => {
            <FavoritePageCards id = {recipe.id} image = {recipe.image} title = {recipe.title}/>
        })
    )
}