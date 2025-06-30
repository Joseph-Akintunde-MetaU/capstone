export function featuredRecipe(dataObject){
    const arr = []
    for(let i = 0; i < dataObject.length; i++){
        const data = dataObject[i]
        let items = {
            "image": data.image,
            "title": data.title,
            "duration": data.readyInMinutes
        }
        arr.push(items)
    }
    return arr
}