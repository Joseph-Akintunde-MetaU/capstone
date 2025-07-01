export function pantryUtil(pantryData){
    const arr = []
    for(let i = 0; i < pantryData.length; i++){
        const data = pantryData[i]
        let items = {
            "id": data.id,
            "name": data.name,
            "quantity": data.quantity,
            "unit": data.unit
        }
        arr.push(items)
    }
    return arr
}