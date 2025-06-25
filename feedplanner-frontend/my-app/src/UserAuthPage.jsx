import {FcGoogle} from "react-icons/fc"
import {FaFacebook} from "react-icons/fa"
import "./UserAuthPage.css"
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword} from "firebase/auth";
import { useCallback, useState } from "react";
import {auth} from "./config/firebase.config"

export function UserAuthPage(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const googleProvider = new GoogleAuthProvider();
    const handleLogin = useCallback(async function () {
        try{
            // For Google sign-in
            const googleUserCred = await signInWithPopup(auth, googleProvider)
            if (googleUserCred) {
                console.log(googleUserCred);
            }
        }catch(error){
            console.log(error)
        }
    }, []);
    function handleEmailCreate(){
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                console.log(user)
                // ...
            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                console.log(errorMessage)
                // ..
            });
    }
    return(
        <div className="UserAuthPage">
            <img width="400px" height="400px" src="img/logo.png" alt="2025 FeedPlanner &copy;" />
            <div className="userInputs">
                <p>WELCOME!</p>
                <form action="" onSubmit={e => e.preventDefault()}>
                    <label htmlFor="username">E-mail: </label>
                    <input
                        type="text"
                        id="username"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                    />
                    <label htmlFor="password">Password: </label>
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                    />
                </form>
                <button style={{margin: 10}} onClick={handleEmailCreate} className="emailSignUp">
                    Sign up
                </button>
            </div>
            <button onClick={handleLogin} className="googleSignIn">
                <p><FcGoogle /> Sign in with Gmail</p>
            </button>
        </div>
    )
}