import { useState, useEffect } from "react"
import { FaStar, FaClock, FaUsers, FaCalendarPlus } from "react-icons/fa"
import { MdHealthAndSafety } from "react-icons/md"
import AddToMealPlan  from "./AddToMealPlan.jsx"
import "./RecipeCard.css"
import { RecipeDetails } from "./RecipeDetails.jsx"
import { getMealPlans } from "../utility/getmealplanner"
import { auth, db } from "../config/firebase.config"
import { ToastContainer, toast } from "react-toastify"
import { RecipeRatings } from "../utility/recipeRatings"
import { doc, getDocs, getDoc, collection } from "firebase/firestore"
import { logUserInteraction } from "../utility/logUserInteraction"

export function RecipeCard({
    id,
    image,
    name,
    instructions,
    ingredients,
    recipes,
    summary,
    cuisines,
    diets,
    dishTypes,
    darkMode,
    cookTime = "30 min",
    healthScore = 0,
    animationDelay = 0,
}) {
    const [openModal, setOpenModal] = useState(false)
    const [hover, setHover] = useState(null)
    const [isFlipped, setIsFlipped] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const bookmarked = `bookmarked: ${id}`
    const [bookmarkedRecipe, setBookmarkedRecipe] = useState(false)
    const [userRating, setUserRating] = useState(null)
    const [medianRating, setMedianRating] = useState(null)
    const [showDetails, setShowDetails] = useState(false)
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
        setIsLoading(true)
        try {
            await RecipeRatings(id.toString(), name, user.uid, value)
            await logUserInteraction(user.uid, "rating")
            setUserRating(value)

            const ratingSnap = await getDoc(doc(db, "recipeRatings", id.toString()))
            if (ratingSnap.exists()) {
                setMedianRating(ratingSnap.data().medianRating || 0)
            }

            toast.success(`Rated ${value} stars!`, {
                position: "top-right",
                autoClose: 2000,
            })
        } catch (error) {
            toast.error("Failed to save rating", {
                position: "top-right",
                autoClose: 2000,
            })
        } finally {
            setIsLoading(false)
        }
    }

    function stripHtml(html) {
        if (!html) return ''
        const tmp = document.createElement('div')
        tmp.innerHTML = html
        return tmp.textContent || tmp.innerText || ''
    }

    async function bookMarkingToggle(e) {
        e.stopPropagation()
        setIsLoading(true)

        try {
            const now = Date.now()
            const thirtyDays = 30 * 24 * 60 * 60 * 1000
            const ingredientsArr = Array.isArray(ingredients)
                ? ingredients
                : ingredients.split(",").map((i) => i.trim().toLowerCase())

            const favoriteRecipesSnap = await getDocs(collection(db, "users", auth.currentUser.uid, "favorites"))
            const favoriteRecipes = favoriteRecipesSnap.docs.map((doc) => doc.data())

            const hasRecentIngredient = favoriteRecipes.some((fav) => {
                if (!fav.timestamp || !fav.ingredients) return false
                const favoritedAt = fav.timestamp
                return (
                    now - favoritedAt <= thirtyDays &&
                    fav.ingredients.some((favIng) => ingredientsArr.includes(favIng.toLowerCase().trim()))
                )
            })

            const token = await auth.currentUser.getIdToken()
            const uid = auth.currentUser.uid
            const nextBookmarkedState = !bookmarkedRecipe

            await fetch("http://localhost:5001/feedplanner/us-central1/api/favorites", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "content-type": "application/json",
                },
                body: JSON.stringify({
                    recipeId: id,
                    recipeName: name,
                    imageUrl: image,
                    isFavorited: nextBookmarkedState,
                    ingredients: ingredientsArr,
                }),
            })

            if (nextBookmarkedState) {
                await logUserInteraction(uid, "frequency")
                toast.success("Added to favorites!", {
                    position: "top-right",
                    autoClose: 2000,
                })
            } else {
                toast.success("Removed from favorites!", {
                    position: "top-right",
                    autoClose: 2000,
                })
            }

            if (nextBookmarkedState && hasRecentIngredient) {
                await logUserInteraction(uid, "recency")
            }

            setBookmarkedRecipe(nextBookmarkedState)
            localStorage.setItem(bookmarked, nextBookmarkedState.toString())
        } catch (error) {
            toast.error("Failed to update favorites", {
                position: "top-right",
                autoClose: 2000,
            })
        } finally {
            setIsLoading(false)
        }
    }

    const ingredientsList = Array.isArray(ingredients) ? ingredients : ingredients?.split(",").map((i) => i.trim()) || []

    return (
        <>
            <div
                className="recipeCard"
                style={{
                    animationDelay: `${animationDelay}s`,
                    animation: "slideInUp 0.6s ease forwards",
                }}
            >
                <div
                    className={`card-inner ${isFlipped ? "flipped" : ""} ${isLoading ? "no-flip" : ""}`}
                    onClick={() => setIsFlipped(!isFlipped)}
                >
                    {/* Front Side */}
                    <div className="front-recipe-card">
                        <div className="image-container">
                            <img src={image} alt={name} />
                            <div className="image-overlay"></div>
                        </div>

                        <div className="card-content">
                            <h3 className="recipe-title">{name}</h3>
                            {summary && (
                                <p className="recipe-summary">
                                    {stripHtml(summary).substring(0, 100)}...
                                </p>
                            )}
                            <div className="recipe-stats">
                                <div className="rating-display">
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar
                                            key={i}
                                            className={`star-display ${i < (medianRating || 0) ? "filled" : ""}`}
                                            color={i < (medianRating || 0) ? "#ffc107" : "#e4e5e9"}
                                        />
                                    ))}
                                </div>

                                {healthScore > 0 && (
                                    <div className="health-score">
                                        <MdHealthAndSafety />
                                        <span>{healthScore}%</span>
                                    </div>
                                )}

                                {cookTime && (
                                    <div className="price-display">
                                        <FaClock />
                                        <span>{cookTime}</span>
                                    </div>
                                )}
                            </div>

                            <div className="card-actions">
                                <button
                                    className="view-recipe-btn"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setShowDetails(!showDetails)
                                    }}
                                >
                                    {showDetails ? "Hide Details" : "View Recipe"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Back Side */}
                    <div className="back-recipe-card">
                        <div className="back-content">
                            <h3 className="back-title">{name}</h3>
                            <p className="rating-prompt">Rate this recipe</p>

                            <div className="ratings">
                                {[...Array(5)].map((star, i) => {
                                    const ratingNumber = i + 1
                                    return (
                                        <label key={ratingNumber}>
                                            <input
                                                type="radio"
                                                name={`rating-${id}`}
                                                id="radio"
                                                value={ratingNumber}
                                                checked={userRating === ratingNumber}
                                                onChange={() => handleRatings(ratingNumber)}
                                                disabled={isLoading}
                                            />
                                            <FaStar
                                                className="star"
                                                color={ratingNumber <= (hover || userRating) ? "#ffc107" : "#e4e5e9"}
                                                size={32}
                                                onMouseEnter={() => setHover(ratingNumber)}
                                                onMouseLeave={() => setHover(null)}
                                            />
                                        </label>
                                    )
                                })}
                            </div>

                            <div className="back-actions">
                                <button
                                    className="meal-plan-btn"
                                    onClick={(e) => {
                                        e.stopPropagation()
                                        setOpenModal(true)
                                    }}
                                    disabled={isLoading}
                                >
                                    <FaCalendarPlus />
                                    ADD TO MEAL PLANNER
                                </button>

                                <button className="favorite-btn" onClick={bookMarkingToggle} disabled={isLoading}>
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

                            <div className="ingredients-list">
                                <h4>Ingredients:</h4>
                                <div className="ingredient-tags">
                                    {ingredientsList.slice(0, 5).map((ingredient, i) => (
                                        <span key={i} className="ingredient-tag">
                                            {ingredient}
                                        </span>
                                    ))}
                                    {ingredientsList.length > 5 && (
                                        <span className="ingredient-tag more-tag">
                                            +{ingredientsList.length - 5} more
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {isLoading && (
                    <div className="loading-overlay">
                        <div className="loading-spinner"></div>
                    </div>
                )}
            </div>

            {openModal && (
                <AddToMealPlan
                    closeModal={() => setOpenModal(false)}
                    selectedRecipeId={id}
                    selectedRecipeName={name}
                    getMealPlans={getMealPlans}
                    recipes={recipes}
                />
            )}
            {showDetails && (
                <RecipeDetails
                    closeModal={() => setShowDetails(false)}
                    image={image}
                    summary={summary}
                    instructions={instructions}
                    ingredients={ingredients}
                    darkMode={darkMode}
                    cuisines={cuisines}
                    dishTypes={dishTypes}
                    diets={diets}
                />
            )}
            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
        </>
    )
}
