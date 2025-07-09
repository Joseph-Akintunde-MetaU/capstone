import "./FeaturedRecipeCard.css"
export function FeaturedRecipeCard({image, title}){
    return(
        <div className="recipeCard">
            <img src={image} alt={title} />
            <h3>{title}</h3>
        </div>
    )
}