export function FavoritePageCards({id, image, title}){
    return(
        <div>
            <img src={image} alt={title} />
            <p>{title}</p>
        </div>
    )
}