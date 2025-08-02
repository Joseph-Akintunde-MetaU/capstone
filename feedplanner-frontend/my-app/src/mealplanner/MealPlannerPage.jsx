
import { useEffect, useState } from "react"
import "./MealPlanner.css"
import { MdOutlineDelete, MdChevronLeft, MdChevronRight } from "react-icons/md"
import { getMealPlans } from "../utility/getmealplanner"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../config/firebase.config"

export function MealPlannerPage({ mealPlans, setMealPlans }) {
    const [groupedData, setGroupedData] = useState({})
    const [loading, setLoading] = useState(false)
    const [currentWeekStart, setCurrentWeekStart] = useState(getWeekStart(new Date()))

    // get the start of the week (Sunday)
    function getWeekStart(date) {
        const d = new Date(date)
        const day = d.getDay()
        const diff = d.getDate() - day
        d.setHours(0, 0, 0, 0);
        return new Date(d.setDate(diff))
    }

    // get array of dates for the current week
    function getWeekDates(weekStart) {
        const dates = []
        for (let i = 0; i < 7; i++) {
            const date = new Date(weekStart)
            date.setDate(weekStart.getDate() + i)
            dates.push(date)
        }
        return dates
    }

    // format date for API calls (YYYY-MM-DD)
    function formatDateForAPI(date) {
        return date.toISOString().split("T")[0]
    }

    // format date for display
    function formatDateForDisplay(date) {
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
        })
    }

    // navigate to previous week
    function goToPreviousWeek() {
        const newWeekStart = new Date(currentWeekStart)
        newWeekStart.setDate(currentWeekStart.getDate() - 7)
        setCurrentWeekStart(newWeekStart)
    }

    // navigate to next week
    function goToNextWeek() {
        const newWeekStart = new Date(currentWeekStart)
        newWeekStart.setDate(currentWeekStart.getDate() + 7)
        setCurrentWeekStart(newWeekStart)
    }

    // go to current week
    function goToCurrentWeek() {
        setCurrentWeekStart(getWeekStart(new Date()))
    }

    // check if it's current week
    function isCurrentWeek() {
        const thisWeekStart = getWeekStart(new Date())
        return currentWeekStart.getTime() === thisWeekStart.getTime()
    }

    async function deleteMealFromPlanner(id) {
        onAuthStateChanged(auth, async (user) => {
            const token = await user.getIdToken()
            if (user) {
                try {
                    setLoading(true)
                    const response = await fetch(`http://localhost:5001/feedplanner/us-central1/api/mealplanner/${id}`, {
                        method: "DELETE",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "content-type": "application/json",
                        },
                    })
                    const weekOf = formatDateForAPI(currentWeekStart)
                    await getMealPlans(setMealPlans, setGroupedData, weekOf)
                } catch (error) {
                    throw new Error(error)
                } finally {
                    setLoading(false)
                }
            }
        })
    }

    useEffect(() => {
        const weekOf = formatDateForAPI(currentWeekStart)
        getMealPlans(setMealPlans, setGroupedData, weekOf)
    }, [currentWeekStart])

    const weekDates = getWeekDates(currentWeekStart)
    const weekDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
    const mealType = ["breakfast", "lunch", "dinner"]

    return (
        <div className={`mealplanner ${loading ? "loading" : ""}`}>
            <div className="planner-header">
                <h2>MY WEEKLY MEAL PLANNER</h2>

                {/* Week Navigation */}
                <div className="week-navigation">
                    <button onClick={goToPreviousWeek} className="nav-btn" disabled={loading}>
                        <MdChevronLeft />
                    </button>

                    <div className="week-info">
                        <span className="week-range">
                            {formatDateForDisplay(weekDates[0])} - {formatDateForDisplay(weekDates[6])}
                        </span>
                        <span className="year">{currentWeekStart.getFullYear()}</span>
                    </div>

                    <button onClick={goToNextWeek} className="nav-btn" disabled={loading}>
                        <MdChevronRight />
                    </button>
                </div>

                {!isCurrentWeek() && (
                    <button onClick={goToCurrentWeek} className="current-week-btn" disabled={loading}>
                        Go to Current Week
                    </button>
                )}
            </div>

            <div className="meal-planner-grid">
                {weekDays.map((day, index) => {
                    const currentDate = weekDates[index]
                    const isToday = currentDate.toDateString() === new Date().toDateString()

                    return (
                        <div key={day} className={`day-column ${isToday ? "today" : ""}`}>
                            <div className="day-header">
                                <h3 className="day-name">{day}</h3>
                                <span className="day-date">{formatDateForDisplay(currentDate)}</span>
                            </div>

                            {groupedData[day] ? (
                                mealType.map((mealType) => {
                                    const recipes = groupedData[day][mealType] || []
                                    return (
                                        <div key={mealType} className="meal-group">
                                            <div className="meal-type">{mealType}</div>
                                            <div className="recipes-container">
                                                {recipes.length > 0 ? (
                                                    recipes.map((recipe) => (
                                                        <div key={recipe.recipeId} className="recipe-name">
                                                            <span className="recipe-text">{recipe.recipeName}</span>
                                                            <button
                                                                onClick={() => deleteMealFromPlanner(recipe.id)}
                                                                className="delete-btn"
                                                                disabled={loading}
                                                            >
                                                                <MdOutlineDelete />
                                                            </button>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="empty-slot">
                                                        <p>No recipes added</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })
                            ) : (
                                <div className="no-meals">
                                    <p>no meal</p>
                                </div>
                            )}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}