import {PantryCard} from "./PantryCard"
export function AllPantry({pantry, getPantry}){
    return (
            pantry.map((item) => 
            <PantryCard key ={item.id} id = {item.id} name = {item.name} quantity={item.quantity} unit = {item.unit} expiryDate = {item.expiryDate} getPantry={getPantry}/>  
    )
)
}