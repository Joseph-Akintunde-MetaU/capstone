/* eslint-disable no-unused-vars */
import { useState,useEffect } from "react"
import './CreatePantryItem.css'
import { auth } from "../config/firebase.config"
import { onAuthStateChanged } from "firebase/auth"
export function CreatePantryItem({closeModal,getPantry}){
    const [name, setName] = useState('')
    const [quantity, setQuantity] = useState('')
    const [unit, setUnit] = useState('') 
    const [expiryDate, setExpiryDate] = useState('')
    async function addPantry(e){
        e.preventDefault();
        const user = auth.currentUser;
        if(user){
            const token = await user.getIdToken();
            const [datePart, timePart] = expiryDate.split("T");
            const [year, month, day] = datePart.split("-").map(Number);
            const [hour, minute] = timePart.split(":").map(Number);
            const localDate = new Date(year, month - 1, day, hour, minute);
            const expiryDateISO = localDate.toISOString();
            const response = await fetch(`http://localhost:5001/feedplanner/us-central1/api/pantry/` ,{
                method: "POST",
                headers:{
                    Authorization: `Bearer ${token}`,
                    'content-type': 'application/json'
                },
                body: JSON.stringify({
                    name: name,
                    quantity: quantity,
                    unit: unit,
                    expiryDate: expiryDateISO
                })
            });
            const data = await response.json();
            getPantry();
            setName('');
            setQuantity('');
            setUnit('');
            setExpiryDate('');
        }else{
            console.log("user not logged in");
        }
    }
    return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Add Pantry Item</h2>
          <button className="close-button" onClick={() => closeModal(false)}>
            ×
          </button>
        </div>

        <form
          action=""
          className="modalToAddPantry"
          onSubmit={async (e) => {
            await addPantry(e)
            closeModal(false)
          }}
        >
          <div className="form-group">
            <label htmlFor="name">Item Name</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Organic Tomatoes, Rice, Cabbages"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Quantity</label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="5"
                min="0"
                step="0.1"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit">Unit</label>
              <input
                type="text"
                id="unit"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="tbsp, kg, lbs"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="expiryDate">Expiry Date</label>
            <input
              type="datetime-local"
              id="expiryDate"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
              required
            />
          </div>

          <div className="button-group">
            <button type="submit" className="btn-primary">
              Add to Pantry
            </button>
            <button type="button" className="btn-secondary" onClick={() => closeModal(false)}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}