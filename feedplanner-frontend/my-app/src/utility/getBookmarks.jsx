import { onAuthStateChanged } from "firebase/auth"
import { auth } from "../config/firebase.config"
export async function GetBookmarks(setBookmarkedData, setLoading){
        onAuthStateChanged(auth, async(user) => {
            try{
                if(user){
                    const token = await user.getIdToken()
                    const fetchBookmarkedIds = await fetch ("http://localhost:5001/feedplanner/us-central1/api/bookmark" , {
                        method: "GET",
                        headers:{
                            Authorization: `Bearer ${token}`,
                            'content-type': 'application/json'
                        }
                    })
                    const bookmarkedIds = await fetchBookmarkedIds.json()
                    setBookmarkedData(bookmarkedIds)
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