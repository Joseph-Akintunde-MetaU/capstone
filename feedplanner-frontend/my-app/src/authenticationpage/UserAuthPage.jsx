import {FcGoogle} from "react-icons/fc"
import "./UserAuthPage.css"
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, validatePassword} from "firebase/auth";
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
    // async function name(params) {
        
    // }
    // const status = await validatePassword(getAuth(), passwordFromUser);
    //     if (!status.isValid) {
    //     // Password could not be validated. Use the status to show what
    //     // requirements are met and which are missing.

    //     // If a criterion is undefined, it is not required by policy. If the
    //     // criterion is defined but false, it is required but not fulfilled by
    //     // the given password. For example:
    //     const needsLowerCase = status.containsLowercaseLetter !== true;
    //     }
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
            <div className="UserAuthPageBody">
                <div className="AuthHeader">
                    <div className="logo">
                        <img className="logo-icon" src="img/logo3.png" alt="2025 FeedPlanner &copy;" />
                    </div>
                    <h2 className="welcome">WELCOME !</h2>
                    <h2 className="auth-mode">SIGN UP</h2>
                </div>

                {/* form */}
                <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleEmailCreate(); }}> 
                    {/* called onsubmit so it works by pressing enter */}
                    <div className="form-group">
                        <label className = "form-label" htmlFor="username">E-mail: </label>
                        <div className="input-container">
                            <span className="input-icon">📧</span>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                placeholder="Enter your e-mail address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className = "form-label" htmlFor="password">Password: </label>
                        <div className="input-container">
                            <span className="input-icon">🔒</span>
                            <input
                                type="password"
                                id="password"
                                className="form-input"
                                value={password}
                                placeholder="Enter your Password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    {<button type="submit" className="btn">
                        Sign up
                    </button>}
                </form>
                <div className="login-section">
                    <p id="toggleText" className="welcome">ALREADY HAVE AN ACCOUNT?</p>
                    <p className="auth-mode">LOGIN</p>
                </div>
               <div className="login">
                <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleEmailSignIn()}}> 
                    <div className="form-group">
                        <label className = "form-label" htmlFor="username">E-mail: </label>
                        <div className="input-container">
                            <span className="input-icon">📧</span>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                placeholder="Enter your e-mail address"
                                value={loginEmail}
                                onChange={(e) => setLoginEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className = "form-label" htmlFor="password">Password: </label>
                        <div className="input-container">
                            <span className="input-icon">🔒</span>
                            <input
                                type="password"
                                id="password"
                                className="form-input"
                                value={loginPassword}
                                placeholder="Enter your Password"
                                onChange={(e) => setLoginPassword(e.target.value)}
                            />
                        </div>
                    </div>
                    {<button type="submit" className="btn">Login
                    </button>}
                </form>
            </div>
            <div className="divider">
                <span className="dividerText">OR</span>
            </div>
            <button onClick={handleGoogleLogin} className="btn">
                <FcGoogle /> Sign in with Google
            </button>
            </div>     
        </div>
    )
}