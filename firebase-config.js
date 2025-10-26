// Configuración de Firebase para PincelArt
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDVW9JZsw3ABOiRdzm2mNYi3Kx4y7tbjU4",
  authDomain: "pincelart-a5a6f.firebaseapp.com",
  projectId: "pincelart-a5a6f",
  storageBucket: "pincelart-a5a6f.firebasestorage.app",
  messagingSenderId: "881733448075",
  appId: "1:881733448075:web:b8cc09d8029ca0ec73bf8e"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios de Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Exportar la app para uso general
export default app;
