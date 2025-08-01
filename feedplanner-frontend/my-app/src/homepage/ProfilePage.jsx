import "./ProfilePage.css"
import { useState, useEffect } from "react"
import { ChangePassword } from "./ChangePassword"
import { auth, db } from "../config/firebase.config"
import { collection, onSnapshot, doc, setDoc,getDocs,getDoc } from "firebase/firestore"

export function ProfilePage({isSignedOut, darkMode, toggleDarkMode}){
    const user = auth.currentUser
    const username = localStorage.getItem("username")
    const email = localStorage.getItem("email")
    const dateJoined = localStorage.getItem("dateJoined")
    const loginMethod = localStorage.getItem("loginMethod")
    const [openModal, setOpenModal] = useState(false)
    const [pantry, setPantry] = useState([])
    const [mealPlans, setMealPlans] = useState([])
    const [favorites, setFavorites] = useState([])
    const [loading, setLoading] = useState(true)
    const [autoAddToCart, setAutoAddToCart] = useState(true)
    const today = new Date() 
    const day = today.getDay()
    const diff = today.getDate() - day
    const startOfWeek =new Date(today.getFullYear(), today.getMonth(), diff)
    startOfWeek.setHours(0,0,0,0)
    const weekOf = startOfWeek.toISOString().split("T")[0]
    useEffect(() => {
        if(!user){
            return;
        }
        const pantryItems = onSnapshot(
            collection(db, "users", user.uid, "pantry"),
            (snap) => setPantry(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        )

        // Only get meal plans for the current week
        const mealsPlanned = onSnapshot(
            collection(db, "users", user.uid, "mealPlan"),
            (snap) => setMealPlans(
            snap.docs
                .map(doc => ({ id: doc.id, ...doc.data() }))
                .filter(plan => plan.weekOf === weekOf)
            )
        )

        const favoriteRecipes = onSnapshot(
            collection(db, "users", user.uid, "favorites"),
            (snap) => setFavorites(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })))
        )

        async function fetchPreference(){
            const prefDoc = doc(db, "users", user.uid, "preferences", "settingsd")
            const getPrefDoc = await getDoc(prefDoc)
            if(getPrefDoc.exists()){
                setAutoAddToCart(getPrefDoc.data().autoAddToCart ?? false)
            }
        }
        fetchPreference()
        setLoading(false)
        return () => {
            pantryItems(),
            mealsPlanned(),
            favoriteRecipes()
        }
    }, [user]);
    async function handleToggle(e){
        const checked = e.target.checked;
        setAutoAddToCart(checked)
        await setDoc(doc(db, "users", user.uid, "preferences", "settings"), {
            autoAddToCart: checked
        }, {merge: true})
    }

    // Get user initials for avatar
    function getUserInitials() {
        if (!username) return "U";
        return username.split(' ').map(name => name[0]).join('').toUpperCase().slice(0, 2);
    }

    // Get greeting based on time
    function getGreeting() {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    }

    return(
        <div className="profile-container">
            <div className="profile-card">
                {/* Profile Header */}
                <div className="profile-header">
                    <div className="profile-avatar">
                        <span className="avatar-text">{getUserInitials()}</span>
                        <div className="avatar-ring"></div>
                    </div>
                    <div className="greeting-text">{getGreeting()},</div>
                    <h2>{username}</h2>
                    <p className="profile-email">{email}</p>
                    <div className="profile-badge">
                        {loginMethod === "google" ? (
                            <span className="badge google-badge">
                                <svg className="badge-icon" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Google Account
                            </span>
                        ) : (
                            <span className="badge email-badge">
                                <svg className="badge-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                                    <polyline points="22,6 12,13 2,6"/>
                                </svg>
                                Email Account
                            </span>
                        )}
                    </div>
                </div>

                {/* Profile Stats */}
                <div className="profile-stats">
                    {loading ? (<div>Loading..</div>) :
                    (<>
                        <div className="stat-item">
                            <div className="stat-number">{mealPlans.length}</div>
                            <div className="stat-label">Meals Planned This Week</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">{favorites.length}</div>
                            <div className="stat-label">Favorites</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">{pantry.length}</div>
                            <div className="stat-label">Pantry Items</div>
                        </div>
                    </>)
                    }
                </div>

                {/* Account Details */}
                <div className="profile-section">
                    <h4>
                        <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                        </svg>
                        Account Details
                    </h4>
                    <div className="detail-grid">
                        <div className="detail-item">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{email}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Username:</span>
                            <span className="detail-value">{username}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Login Method:</span>
                            <span className="detail-value">{loginMethod === "google" ? "Google" : "Email"}</span>
                        </div>
                        <div className="detail-item">
                            <span className="detail-label">Member Since:</span>
                            <span className="detail-value">{dateJoined}</span>
                        </div>
                    </div>
                </div>

                {/* Preferences Section */}
                <div className="profile-section">
                    <h4>
                        <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <circle cx="12" cy="12" r="3"/>
                            <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"/>
                        </svg>
                        Preferences
                    </h4>
                    <div className="preference-grid">
                        <div className="preference-item">
                            <span>Darkmode</span>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={darkMode} onChange={toggleDarkMode} />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="preference-item">
                            <span>Auto-Add Expiring Items to Cart</span>
                            <label className="toggle-switch">
                                <input type="checkbox" checked={autoAddToCart} onChange={handleToggle}/>
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="profile-section">
                    <h4>
                        <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M9 12l2 2 4-4"/>
                            <path d="M21 12c-1 0-3-1-3-3s2-3 3-3 3 1 3 3-2 3-3 3"/>
                            <path d="M3 12c1 0 3-1 3-3s-2-3-3-3-3 1-3 3 2 3 3 3"/>
                            <path d="M12 3c0 1-1 3-3 3s-3-2-3-3 1-3 3-3 3 2 3 3"/>
                            <path d="M12 21c0-1 1-3 3-3s3 2 3 3-1 3-3 3-3-2-3-3"/>
                        </svg>
                        Account Actions
                    </h4>
                    <div className="profile-actions">
                        {loginMethod !== "google" && (
                            <button 
                                className="action-btn secondary-btn"
                                onClick={() => setOpenModal(true)}
                            >
                                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                    <circle cx="12" cy="16" r="1"/>
                                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                                </svg>
                                Change Password
                            </button>
                        )}
                        <button 
                            className="action-btn danger-btn"
                            onClick={isSignedOut}
                        >
                            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                                <polyline points="16,17 21,12 16,7"/>
                                <line x1="21" y1="12" x2="9" y2="12"/>
                            </svg>
                            Log Out
                        </button>
                    </div>
                </div>

                {openModal && <ChangePassword close={setOpenModal} isSignedOut={isSignedOut}/>}
            </div>
        </div>
    )
}