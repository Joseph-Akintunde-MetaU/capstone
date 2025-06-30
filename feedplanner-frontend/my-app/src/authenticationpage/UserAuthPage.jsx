import {FcGoogle} from "react-icons/fc"
import "./UserAuthPage.css"
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged} from "firebase/auth";
import { useState } from "react";
import {auth} from "../config/firebase.config"
import { useNavigate } from "react-router-dom";

export function UserAuthPage(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const googleProvider = new GoogleAuthProvider();
    const baseUrl = "http://127.0.0.1:5001/feedplanner/us-central1/validateUserJWTToken"
    async function handleGoogleLogin(){
        try{
            // For Google sign-in
            const googleUserCred = await signInWithPopup(auth, googleProvider)
            if (googleUserCred) {
                console.log(googleUserCred);
            }
            const googleUser = googleUserCred.user
            const token = await googleUser.getIdToken(true)
                const response = await fetch(
                    baseUrl,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
            isLoggedIn()
            localStorage.setItem("email", googleUser.email)
        }catch(error){
            console.log(error)
        }
    };

    const nav = useNavigate()
    function isLoggedIn(){
        onAuthStateChanged(auth, (user) => {
        if (user) {
            nav("/home")
            const uid = user.uid;
        } else {
            
        }
    })
    }
    async function handleEmailCreate(){
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        try{
                const user = userCredential.user;
                console.log(user)
                const token = await user.getIdToken(true)
                console.log(token)
                const response = await fetch(
                    baseUrl,
                    {
                        method: "GET",
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                )
                isLoggedIn()
                localStorage.setItem("email", user.email)  
            }catch(error){
                const errorMessage = error.message;
                console.log(errorMessage)
            };
    }
    async function handleEmailSignIn(){
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
            try{
                const user = userCredential.user;
                console.log(user)
                const token = await user.getIdToken(true)
                console.log(token)
                isLoggedIn()
                localStorage.setItem("email", user.email)
            }catch(error){
            const errorMessage = error.message;
            console.log(errorMessage)
        };
    }
    return(
        <div className="UserAuthPage">
            <img width="450px" height="400px" src="img/logo3.png" alt="2025 FeedPlanner &copy;" />
            <div className="signup">
                <p>WELCOME! <br />SIGN UP</p>
                <form onSubmit={(e) => { e.preventDefault(); handleEmailCreate(); }}> 
                    {/* called onsubmit so it works by pressing enter */}
                    <label htmlFor="username">E-mail: </label>
                    <input
                        type="email"
                        placeholder="Enter your e-mail address"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="password">Password: </label>
                    <input
                        type="password"
                        value={password}
                        placeholder="Enter your Password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {email && password && <button style={{margin: 10}} type="submit" className="emailSignUp">
                        Sign up
                    </button>}
                </form>
            </div>
            <p>ALREADY HAVE AN ACCOUNT? <br /> LOGIN</p>
            <div className="login">
                <form action="" onSubmit={(e) => { e.preventDefault(); handleEmailSignIn(); }}>
                    <label htmlFor="loginUsername">E-mail: </label>
                    <input
                        type="email"
                        id="loginUsername"
                        placeholder="Enter your e-mail address"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                    />
                    <label htmlFor="loginPassword">Password: </label>
                    <input
                        type="password"
                        id="loginPassword"
                        placeholder = "Enter your Password"
                        value={loginPassword}
                        onChange={e => setLoginPassword(e.target.value)}
                    />
                    <button style={{margin: 10}} onClick = {handleEmailSignIn} type="submit" className="emailSignIn">
                        Log In
                    </button>
                </form>
            </div>
            <button onClick={handleGoogleLogin} className="googleSignIn">
                <p><FcGoogle /> Sign in with Google</p>
            </button>
        </div>
    )
}