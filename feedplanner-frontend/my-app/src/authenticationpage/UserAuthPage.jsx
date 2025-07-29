import {FcGoogle} from "react-icons/fc"
import "./UserAuthPage.css"
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged} from "firebase/auth";
import { useState } from "react";
import {auth, db} from "../config/firebase.config"
import { setDoc,doc,serverTimestamp,getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
export function UserAuthPage(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const [username, setUsername] = useState('')
    const [showLogin, setShowLogin] = useState(false);
    function toggleAuthMode(){
        setShowLogin((prev) => !prev);
    }
    const googleProvider = new GoogleAuthProvider();
    const baseUrl = "/feedplanner/us-central1/validateUserJWTToken"
    async function handleGoogleLogin(){
        try{
            // For Google sign-in
            const googleUserCred = await signInWithPopup(auth, googleProvider)
            const googleUser = googleUserCred.user
            // Only create user doc if it doesn't exist (don't overwrite createdAt on login)
            const userDocRef = doc(db, "users", googleUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (!userDocSnap.exists()) {
                await setDoc(userDocRef, {
                    email: googleUser.email,
                    username: googleUser.displayName,
                    userId: googleUser.uid,
                    createdAt: serverTimestamp()
                });
            }
            const token = await googleUser.getIdToken()
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
            if (userDocSnap.exists()) {
                const userData = userDocSnap.data();
                // Convert Firestore Timestamp to JS Date
                const createdAt = userData.createdAt?.toDate
                    ? userData.createdAt.toDate()
                    : new Date();
                // Format as you like:
                const formatted = createdAt.toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                    timeZoneName: "short"
                });
                localStorage.setItem("dateJoined", formatted);
            }
            localStorage.setItem("username", googleUser.displayName) 
            localStorage.setItem("email", googleUser.email) 
            localStorage.setItem("loginMethod", "google")
        }catch(error){
            console.log(error)
        }
    };

    const nav = useNavigate()
    function isLoggedIn(){
        onAuthStateChanged(auth, (user) => {
        try{
            if (user) {
                nav("/home")
                const uid = user.uid;
        } else{
            console.log("User not logged in")
        }
        }catch(error){
            throw new Error(error)
        }
    })
    }
    async function handleEmailCreate(){
        const userCredential = await createUserWithEmailAndPassword(auth, email, password)
        try{
                const user = userCredential.user;
                await setDoc(doc(db, "users", user.uid),{
                    email: user.email,
                    username: username,
                    userId: user.uid,
                    createdAt: serverTimestamp()
                })
                // eslint-disable-next-line no-unused-vars
                const token = await user.getIdToken()
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
                localStorage.setItem("username", username) 
                localStorage.setItem("email", user.email) 
                localStorage.setItem("dateJoined", serverTimestamp())
                localStorage.setItem("loginMethod", "email")
            }catch(error){
                throw new Error(error)
            };
    }
    async function handleEmailSignIn(){
            const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
            try{
                const user = userCredential.user;
                const token = await user.getIdToken()
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
            }catch(error){
            const errorMessage = error.message;
            console.log(errorMessage)
        };
    }
    return(
        <div className="UserAuthPage">
            {/* Add these elements to your UserAuthPage component */}
            <div className="food-animation food-1"><img src="https://img.icons8.com/?size=100&id=AdSgGRnON0R9&format=png&color=000000"/></div>
            <div className="food-animation food-2"><img src="https://img.icons8.com/?size=100&id=119923&format=png&color=000000"/></div>
            <div className="food-animation food-3"><img src="https://img.icons8.com/?size=100&id=120148&format=png&color=000000"/></div>
            <div className="food-animation food-4"><img src="https://img.icons8.com/?size=100&id=120092&format=png&color=000000" alt="" /></div>
            <div className="food-animation food-5"><img src="https://img.icons8.com/?size=100&id=120103&format=png&color=000000" alt="" /></div>
            <div className="food-animation food-6"><img src="https://img.icons8.com/?size=100&id=121571&format=png&color=000000" alt="" /></div>
            <div className="food-animation food-7"><img src="https://img.icons8.com/?size=100&id=XULgt0zG41wA&format=png&color=000000" alt="" /></div>
            

            <div className="trash-can trash-1"><img src="https://img.icons8.com/?size=100&id=737&format=png&color=000000" alt="" /></div>
            <div className="trash-can trash-2"><img src="https://img.icons8.com/?size=100&id=zJJqvhIgeWKO&format=png&color=000000" alt="" /></div>

            <div className="no-waste-message">No Food Waste! </div>
            <div className="UserAuthPageBody">
                <div className="AuthHeader">
                    <div className="logo">
                        <img className="logo-icon" src="img/logo3.png" alt="2025 FeedPlanner &copy;" />
                    </div>
                    <h2 className="welcome">WELCOME !</h2>
                    <h2 className="auth-mode">{showLogin ? "LOGIN" : "SIGN UP"}</h2>
                </div>
                {!showLogin ? (
                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleEmailCreate(); }}> 
                        <div className="form-group">
                        <label className = "form-label" htmlFor="username">E-mail: </label>
                        <div className="input-container">
                            <img className="input-icon" src="https://img.icons8.com/?size=100&id=tiHbAqWU3ZCQ&format=png&color=000000"/>
                            <input
                                type="email"   
                                className="form-input"
                                placeholder="Enter your e-mail address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className = "form-label" htmlFor="username">Username: </label>
                        <div className="input-container">
                            <img className="input-icon" src = "https://img.icons8.com/?size=100&id=11779&format=png&color=000000"/>
                            <input
                                type="text"
                                className="form-input"
                                value={username}
                                placeholder="Enter a Username"
                                onChange={(e) => setUsername(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className = "form-label" htmlFor="password">Password: </label>
                        <div className="input-container">
                            <img className="input-icon" src = "https://img.icons8.com/?size=100&id=7Sm4QkMSvsON&format=png&color=000000"/>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                placeholder="Enter your Password"
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>
                        <button type="submit" className="btn">Sign up</button>
                    </form>
                ) : (
                    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); handleEmailSignIn()}}> 
                        <div className="form-group">
                            <label className = "form-label" htmlFor="username">E-mail: </label>
                            <div className="input-container">
                                <img className="input-icon" src="https://img.icons8.com/?size=100&id=tiHbAqWU3ZCQ&format=png&color=000000"/>
                                <input
                                    type="email"
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
                            <img className="input-icon" src = "https://img.icons8.com/?size=100&id=7Sm4QkMSvsON&format=png&color=000000"/>
                            <input
                                type="password"
                                className="form-input"
                                value={loginPassword}
                                placeholder="Enter your Password"
                                onChange={(e) => setLoginPassword(e.target.value)}
                            />
                        </div>
                    </div>
                        <button type="submit" className="btn">Login</button>
                    </form>
                )}
                {!showLogin ? (
                    <div className="login-section" onClick={toggleAuthMode}>
                        <p id="toggleText" className="welcome">ALREADY HAVE AN ACCOUNT?</p>
                        <p className="auth-mode">LOGIN</p>
                    </div>
                ) : (
                    <div className="login-section" onClick={toggleAuthMode}>
                        <p className="auth-mode">Back to Sign Up</p>
                    </div>
                )}
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