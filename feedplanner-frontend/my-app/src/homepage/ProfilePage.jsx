import "./ProfilePage.css"
import { useState } from "react"
import { ChangePassword } from "./ChangePassword"
export function ProfilePage({isSignedOut}){
    const username = localStorage.getItem("username")
    const email = localStorage.getItem("email")
    const[openModal, setOpenModal] = useState(false)
    return(
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <h2>{username}</h2>
                    <p>{email}</p>
                </div>
                <div className="profile-section">
                    <h4>Account Details</h4>
                    <p><strong>Email: </strong>{email}</p>
                </div>
                <div className="profile-section">
                    <h4>Actions</h4>
                    <div className="profile-actions">
                        <button onClick={() => setOpenModal(true)}>change password</button>
                        <button onClick={isSignedOut}>log out</button>
                    </div>
                    {openModal && <ChangePassword close={setOpenModal} isSignedOut={isSignedOut}/>}
                </div>
            </div>
        </div>
    )
}