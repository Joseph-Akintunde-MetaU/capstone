export async function fetchSubstitutes(expiredName, token, topSubs = 2, overrideWeights = null){
    const response = await fetch (`http://localhost:5001/feedplanner/us-central1/api/substitutes/`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-type": "application/json"
        },
        body: JSON.stringify({
            expiredName,
            topSubs,
            ...(overrideWeights ? {weights: overrideWeights} : {})
        })
    })
    if(response.ok){
        const data = await response.json()
        return data
    }
}