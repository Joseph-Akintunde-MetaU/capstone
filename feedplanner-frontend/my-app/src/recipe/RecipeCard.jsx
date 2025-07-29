import AddToMealPlan from "./AddToMealPlan"
import "./RecipeCard.css"
import { getMealPlans } from "../utility/getmealplanner"
import { FaStar } from "react-icons/fa"
import { auth } from "../config/firebase.config"
import { useState, useEffect } from "react"
import { ToastContainer } from "react-toastify"
import { RecipeRatings } from "../utility/recipeRatings"
import { doc, getDocs, getDoc, collection } from "firebase/firestore"
import { db } from "../config/firebase.config"
import { logUserInteraction } from "../utility/logUserInteraction"

export function RecipeCard({ id, image, name, score, ingredients, recipes }) {
    const [openModal, setOpenModal] = useState(false)
    const [hover, setHover] = useState(null)
    const bookmarked = `bookmarked: ${id}`
    const [bookmarkedRecipe, setBookmarkedRecipe] = useState(false)
    const [userRating, setUserRating] = useState(null)
    const [medianRating, setMedianRating] = useState(null)
    const user = auth.currentUser

    useEffect(() => {
        const storedBookmark = localStorage.getItem(bookmarked)
        if (storedBookmark === "true") {
            setBookmarkedRecipe(true)
        }
    }, [bookmarked])

    useEffect(() => {
        async function fetchRatings() {
            const ratingSnap = await getDoc(doc(db, "recipeRatings", id.toString()))
            if (ratingSnap.exists()) {
                setMedianRating(ratingSnap.data().medianRating || 0)
            }
            if (user?.uid) {
                const userSnap = await getDoc(doc(db, "recipeRatings", id.toString(), "userRatings", user.uid))
                if (userSnap.exists()) {
                    setUserRating(userSnap.data().value)
                }
            }
        }
        fetchRatings()
    }, [id, user?.uid])

    async function handleRatings(value) {
        await RecipeRatings(id.toString(), name, user.uid, value)
        await logUserInteraction(user.uid, "rating")
        setUserRating(value)
        const ratingSnap = await getDoc(doc(db, "recipeRatings", id.toString()))
        if (ratingSnap.exists()) {
            setMedianRating(ratingSnap.data().medianRating || 0)
        }
    }

    async function bookMarkingToggle(e) {
        e.stopPropagation()
        const now = Date.now()
        const thirtyDays = 30 * 24 * 60 * 60 * 1000
        const ingredientsArr = Array.isArray(ingredients) ? ingredients : ingredients.split(",").map(i => i.trim().toLowerCase())
        const favoriteRecipesSnap = await getDocs(collection(db, "users", auth.currentUser.uid, "favorites"))
        const favoriteRecipes = favoriteRecipesSnap.docs.map(doc => doc.data())
        const hasRecentIngredient = favoriteRecipes.some(fav => {
            if (!fav.timestamp || !fav.ingredients) return false
            const favoritedAt = fav.timestamp
            return (
                now - favoritedAt <= thirtyDays &&
                fav.ingredients.some(favIng =>
                    ingredientsArr.includes(favIng.toLowerCase().trim())
                )
            )
        })
        const token = await auth.currentUser.getIdToken()
        const uid = auth.currentUser.uid
        const nextBookmarkedState = !bookmarkedRecipe
        await fetch("http://localhost:5001/feedplanner/us-central1/api/favorites", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
                'content-type': 'application/json'
            },
            body: JSON.stringify({
                recipeId: id,
                recipeName: name,
                imageUrl: image,
                isFavorited: nextBookmarkedState,
                ingredients: ingredientsArr
            }),
        })
        if (nextBookmarkedState) {
            await logUserInteraction(uid, "frequency")
        }
        if (nextBookmarkedState && hasRecentIngredient) {
            await logUserInteraction(uid, "recency")
        }
        setBookmarkedRecipe(nextBookmarkedState)
        localStorage.setItem(bookmarked, nextBookmarkedState.toString())
    }

    return (
        <div>
            <div className="recipeCard">
                <div className="card-inner">
                    <div className="front-recipe-card">
                        <img src={image} alt={name} />
                        <p>{name}</p>
                        <p>{score}</p>
                        <p>
                            Ingredients used: {
                                Array.isArray(ingredients)
                                    ? ingredients.join(" - ")
                                    : ingredients.split(",").map(i => i.trim()).join(" - ")
                            }
                        </p>
                    </div>
                    <div className="back-recipe-card">
                        <div className="ratings">
                            {[...Array(5)].map((star, i) => {
                                const ratingNumber = i + 1
                                return (
                                    <label key={ratingNumber}>
                                        <input
                                            type="radio"
                                            name=""
                                            id="radio"
                                            value={ratingNumber}
                                            checked={userRating === ratingNumber}
                                            onClick={() => handleRatings(ratingNumber)}
                                            readOnly
                                        />
                                        <FaStar
                                            className="star"
                                            color={ratingNumber <= (hover || userRating) ? "var(--text-primary)" : "white"}
                                            size={30}
                                            onMouseEnter={() => setHover(ratingNumber)}
                                            onMouseLeave={() => setHover(null)}
                                        />
                                    </label>
                                )
                            })}
                        </div>
                        <button onClick={e => {
                            e.stopPropagation()
                            setOpenModal(true)
                        }}>
                            ADD TO MEAL PLANNER
                        </button>
                        <button onClick={bookMarkingToggle}>
                            <img
                                src={
                                    bookmarkedRecipe
                                        ? "https://img.icons8.com/?size=100&id=26083&format=png&color=000000"
                                        : "https://img.icons8.com/?size=100&id=25157&format=png&color=000000"
                                }
                                alt={bookmarkedRecipe ? "Bookmarked" : "Not Bookmarked"}
                            />
                        </button>
                    </div>
                </div>
            </div>
            {openModal &&
                <AddToMealPlan
                    closeModal={setOpenModal}
                    selectedRecipeId={id}
                    selectedRecipeName={name}
                    getMealPlans={getMealPlans}
                    recipes={recipes}
                />
            }
            <ToastContainer
                position='top-right'
                autoClose={5000}
                closeOnClick
                pauseOnHover
                draggable
                hideProgressBar={false}
                theme="light"
            />
        </div>
    )
}