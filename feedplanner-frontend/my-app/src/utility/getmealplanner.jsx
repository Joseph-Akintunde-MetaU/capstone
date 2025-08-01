import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../config/firebase.config"

export async function getMealPlans(setMealPlans, setGroupedData, weekOf = null) {
    onAuthStateChanged(auth, async (user) => {
        try {
            if (user) {
                const token = await user.getIdToken()
                const response = await fetch(
                    `http://localhost:5001/feedplanner/us-central1/api/mealPlanner?weekOf=${weekOf}`,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`,
                            "content-type": "application/json",
                        },
                    }
                )
                const data = await response.json()
                setMealPlans(data)
                const groupedByDayAndMeal = data.reduce((acc, plan) => {
                    const day = plan.dayOfTheWeek
                    const mealType = plan.mealType
                    if (!acc[day]) acc[day] = {}
                    if (!acc[day][mealType]) acc[day][mealType] = []
                    const isDuplicate = acc[day][mealType].some(
                        (existing) =>
                            existing.dayOfTheWeek === plan.dayOfTheWeek &&
                            existing.mealType === plan.mealType
                    )
                    if (!isDuplicate) {
                        acc[day][mealType].push(plan)
                    }
                    return acc
                }, {})
                setGroupedData(groupedByDayAndMeal)
            }
        } catch (error) {
            console.error(error)
        }
    })
}