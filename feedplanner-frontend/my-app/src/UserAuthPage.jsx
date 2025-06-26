import {FcGoogle} from "react-icons/fc"
import {FaFacebook} from "react-icons/fa"
import "./UserAuthPage.css"
import { GoogleAuthProvider, signInWithPopup, createUserWithEmailAndPassword, signInWithEmailAndPassword, FacebookAuthProvider, onAuthStateChanged} from "firebase/auth";
import { useState } from "react";
import {auth} from "./config/firebase.config"
import { useNavigate } from "react-router-dom";

export function UserAuthPage(){
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPassword, setLoginPassword] = useState('')
    const googleProvider = new GoogleAuthProvider();
    async function handleGoogleLogin(){
        try{
            // For Google sign-in
            const googleUserCred = await signInWithPopup(auth, googleProvider)
            if (googleUserCred) {
                console.log(googleUserCred);
            }
           isLoggedIn()
        }catch(error){
            console.log(error)
        }
    };
    const facebookProvider = new FacebookAuthProvider();
    async function handleFBLogin(){
        signInWithPopup(auth, facebookProvider)
        .then((result) => {
            // The signed-in user info.
            const user = result.user;
            // This gives you a Facebook Access Token. You can use it to access the Facebook API.
            const credential = FacebookAuthProvider.credentialFromResult(result);
            const accessToken = credential.accessToken;
            isLoggedIn()
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.customData.email;
            // The AuthCredential type that was used.
            const credential = FacebookAuthProvider.credentialFromError(error);
  });

    }
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
    function handleEmailCreate(){
        //For creating email and password
        createUserWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed up 
                const user = userCredential.user;
                console.log(user)
                isLoggedIn()
            })
            .catch((error) => {
                const errorMessage = error.message;
                console.log(errorMessage)
            });
    }
    function handleEmailSignIn(){
        signInWithEmailAndPassword(auth, loginEmail, loginPassword)
        .then((userCredential) => {
            // Signed in 
            const user = userCredential.user;
            console.log(user)
            isLoggedIn()
        })
        .catch((error) => {
            const errorMessage = error.message;
            console.log(errorMessage)
        });
    }
    return(
        <div className="UserAuthPage">
            <img width="400px" height="400px" src="img/logo.png" alt="2025 FeedPlanner &copy;" />
            <div className="signup">
                <p>WELCOME! <br />SIGN UP</p>
                <form onSubmit={(e) => { e.preventDefault(); handleEmailCreate(); }}> 
                    {/* called onsubmit so it works by pressing enter */}
                    <label htmlFor="username">E-mail: </label>
                    <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <label htmlFor="password">Password: </label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button style={{margin: 10}} type="submit" className="emailSignUp">
                        Sign up
                    </button>
                </form>
            </div>
            <p>ALREADY HAVE AN ACCOUNT? <br /> LOGIN</p>
            <div className="login">
                <form action="" onSubmit={(e) => { e.preventDefault(); handleEmailSignIn(); }}>
                    <label htmlFor="loginUsername">E-mail: </label>
                    <input
                        type="text"
                        id="loginUsername"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                    />
                    <label htmlFor="loginPassword">Password: </label>
                    <input
                        type="password"
                        id="loginPassword"
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
            <button style={{margin: 10}} onClick={handleFBLogin} className="googleSignIn">
                <p><FaFacebook /> Sign in with Facebook</p>
            </button>
        </div>
    )
}