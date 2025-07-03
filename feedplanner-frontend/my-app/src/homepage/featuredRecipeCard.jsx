import "./FeaturedRecipeCard.css"
export function FeaturedRecipeCard({image, title, duration}){

    return(
        <div className="cardContainer">
            <div className="recipeCard">
                <img src={image} alt={title} />
                <h3>{title}</h3>
                <p>{duration}</p>
        </div> 
        </div>
    )
}