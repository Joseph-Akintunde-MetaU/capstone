/* eslint-disable no-undef */
import {initializeApp, getApp, getApps} from 'firebase/app' 
import {getAuth} from 'firebase/auth'
import {getFirestore} from "firebase/firestore"
import {getStorage} from "firebase/storage"
const firebaseConfig = {
  apiKey:"AIzaSyAaoHWxkXWsJCro3bugtzkOBcghnEu8hzc",
  authDomain:"feedplanner.firebaseapp.com",
  projectId:'feedplanner',
  storageBucket:"feedplanner.firebasestorage.app",
  messagingSenderId:"741556750859",
  appId:"1:741556750859:web:0a158bf52071e68843950e",
  measurementId:"G-86F929D047"
};
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig) 
const auth = getAuth(app) 
const db = getFirestore(app)
const storage = getStorage(app)

export {auth, db, storage}