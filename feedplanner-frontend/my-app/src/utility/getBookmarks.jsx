import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../config/firebase.config"
export async function GetBookmarks(setFavoritedData, setLoading){
        onAuthStateChanged(auth, async(user) => {
            try{
                if(user){
                    const token = await user.getIdToken()
                    const fetchFavoriteIds = await fetch ("http://localhost:5001/feedplanner/us-central1/api/favorites" , {
                        method: "GET",
                        headers:{
                            Authorization: `Bearer ${token}`,
                            'content-type': 'application/json'
                        }
                    })
                    const favoritedIds = await fetchFavoriteIds.json()
                    setFavoritedData(favoritedIds)
                }else{
                    throw new Error
                }
            }catch(error){
                console.error(error)
            }finally{
                setLoading(false)
            }
            }
        )}