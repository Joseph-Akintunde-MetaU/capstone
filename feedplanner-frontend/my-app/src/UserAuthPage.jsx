import {FcGoogle} from "react-icons/fc"
import "./UserAuthPage.css"
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { useCallback } from "react";
import {auth} from "./config/firebase.config"

export function UserAuthPage(){
    const googleProvider = new GoogleAuthProvider();
    const handleLogin = useCallback(async function () {
        try{
            const userCred = await signInWithRedirect(auth, googleProvider)
            if(userCred){
                 console.log(userCred)
            }
        }catch(error){
            console.log(error)
        }
    }, []);
    return(
             <div className="UserAuthPage">
                <img width = "400px" height= "400px" src="img/logo.png" alt="" />
                <div className="userInputs">
                    <p>WELCOME!</p>
                </div>
                <button onClick={handleLogin} className="googleSignIn">
                    <p><FcGoogle/> Sign in with Gmail</p>
                </button>
             </div>
    )
}