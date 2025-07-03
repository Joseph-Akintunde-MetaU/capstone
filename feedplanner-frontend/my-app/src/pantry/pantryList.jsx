import { PantryCard } from "./PantryCard"
export function PantryList({pantry, getPantry}){
    return( pantry.map((pantry) => (
            <PantryCard id = {pantry.id} name = {pantry.name} quantity = {pantry.quantity} unit = {pantry.unit} getPantry={getPantry}/>
        ))
    )
}