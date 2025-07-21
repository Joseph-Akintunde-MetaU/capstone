export function ScoreRecommendationForRecipes(pantryItems, favoriteRecipes, recipes){
    const frequencyMap = {}
    recipes.forEach((recipe) => {
        recipe.ingredients.forEach((ingredient) => {
                const key = ingredient.toLowerCase().trim()
                const count = favoriteRecipes.filter(fav => fav.ingredients.map
                    (i => i.toLowerCase().trim()).includes(key))
                    .length;
                frequencyMap[key] = count;
        })
    })

    const recencyMap = {}
    favoriteRecipes.forEach((fav) => {
        fav.ingredients.forEach((ingredient) => {
            const key = ingredient.toLowerCase().trim()
            const time = fav.timestamp
            if(!recencyMap[fav] || time > recencyMap[key]){
                recencyMap[key] = time
            }
        })
    })

    const favoriteIngredientSet = new Set()
    favoriteRecipes.forEach(fav => {
        fav.ingredients.forEach((ing) => favoriteIngredientSet.add
        (ing.toLowerCase().trim()))
    })
    
    const pantrySet = new Set(pantryItems.map
        ((ing) => ing.toLowerCase().trim()))
    const scoredRecipes = []
    const date = Date.now()
    recipes.forEach(recipe => {
        let match = 0;
        let frequency = 0;
        let recency = 0;
        recipe.ingredients.forEach((ingredient) => {
            const key = ingredient.toLowerCase().trim();
            if (pantrySet.has(key)){
                match += 1
            }
            if(frequencyMap[key]){
                frequency += frequencyMap[key]
            }
            if(recencyMap[key]){
                const millisecondsInADay = 24 * 60 * 60 * 1000
                const daysAgo = (date - recencyMap[key]) / millisecondsInADay
                recency += 1 / (daysAgo + 1)
            }
        });
        scoredRecipes.push({
            ...recipe,
            scores: {
                match,
                frequency,
                recency
            }
        })
    })
    const matchScores = scoredRecipes.map((r) => r.scores.match);
    const frequencyScores = scoredRecipes.map((r) => r.scores.frequency)
    const recencyScores = scoredRecipes.map((r) => r.scores.recency)
    function normalizeScore(score, min, max){
        return (
            max === min ? 
            0 :
            (score - min)/(max - min)
        )
    }
    const matchMin = Math.min(...matchScores)
    const matchMax = Math.max(...matchScores)
    const frequencyMin = Math.min(...frequencyScores)
    const frequencyMax = Math.max(...frequencyScores)
    const recencyMin = Math.min(...recencyScores)
    const recencyMax = Math.max(...recencyScores)

    scoredRecipes.forEach((recipe) => {
        const {match, frequency, recency} = recipe.scores
        recipe.normalizedScores = {
            matchScore: normalizeScore(match, matchMin, matchMax),
            frequencyScore: normalizeScore(frequency, frequencyMin, frequencyMax),
            recencyScore: normalizeScore(recency, recencyMin, recencyMax)
        }
    })
    const weights = {
        match: 0.4,
        frequency: 0.3,
        recency: 0.3
    }
    scoredRecipes.forEach((recipe) => {
        const normalizedScoresForRecipe = recipe.normalizedScores;
        recipe.finalScore = 
            (normalizedScoresForRecipe['matchScore'] * weights.match) +
            (normalizedScoresForRecipe['frequencyScore'] * weights.frequency) +
            (normalizedScoresForRecipe['recencyScore'] * weights.recency)
    })
    const sortedRecipes = scoredRecipes.sort((a, b) => b.finalScore - a.finalScore)
    return sortedRecipes
}