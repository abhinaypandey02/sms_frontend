import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";


const firebaseConfig = {
    apiKey: "AIzaSyAU8m__3_JRbwHkvbmazDm5pdfizyxSzFE",
    authDomain: "nexmo-50c56.firebaseapp.com",
    projectId: "nexmo-50c56",
    storageBucket: "nexmo-50c56.appspot.com",
    messagingSenderId: "881082434456",
    appId: "1:881082434456:web:a2d7246a199a1c6274e1ed",
    measurementId: "G-DXCVM20MEK"
};
const EMAIL="learouillet02@gmail.com"

initializeApp(firebaseConfig);
const auth = getAuth();

export async function signIn(password){
    try{
        const userCredentials=await signInWithEmailAndPassword(auth, EMAIL, password);
        if(userCredentials&&userCredentials.user){
            return true;
        }
    } catch (e) {
        return false;
    }
}