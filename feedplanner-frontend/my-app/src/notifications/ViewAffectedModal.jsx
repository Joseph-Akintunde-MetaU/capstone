import { useEffect, useState } from "react"
import { auth } from "../config/firebase.config"
import { db } from "../config/firebase.config"
import { collection, getDocs } from "firebase/firestore"
import "./ViewAffectedModal.css"
export function ViewAffectedModal({notification, onClose}){
    const recipes = notification.affectedRecipes || []
    const substitutes = notification.substitutes || []
    const expiredIngredient = notification.expiredIngredient
    const [fetchedSubstitutes, setFetchedSubstitutes] = useState([]);

    useEffect(() => {
        async function fetchSubstitutes() {
            if (!expiredIngredient) return;
            try {
            const substitutesRef = collection(db, "substitutes");
            const snapshot = await getDocs(substitutesRef);
            const subs = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                if (data.ingredient === expiredIngredient && Array.isArray(data.substitutes)) {
                subs.push(...data.substitutes);
                }
            });
            setFetchedSubstitutes(subs);
            } catch (error) {
            setFetchedSubstitutes([]);
            }
        }
        fetchSubstitutes();
    }, [expiredIngredient]);
    return (
        <div className="affected-modal-overlay">
            <div className="modal-box">
                <h3>Recipes using "{expiredIngredient}"</h3>
                {recipes.length > 0 ? (
                    <ul>
                        {recipes.map((recipe, i) => (
                            <li key={i}>
                                <h3>
                                    <strong>
                                        {recipe.recipeName} ({recipe.dayOfTheWeek}, {recipe.mealType})
                                    </strong>
                                </h3>
                                <ul>
                                    <strong>Substitutes for {expiredIngredient} in {recipe.recipeName}:</strong>
                                    {substitutes.length > 0 ? (
                                        <p>
                                            {substitutes.map((sub, j) => (
                                                <li key={j}>{sub}</li>
                                            ))}
                                        </p>
                                    ) : (
                                        <p>Oops! No substitutes found!</p>
                                    )}
                                </ul>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No recipes found using this ingredient</p>
                )}
                <button onClick={onClose}>CLOSE</button>
            </div>
        </div>
    )
}