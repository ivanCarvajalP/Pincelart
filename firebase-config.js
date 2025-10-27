// Configuración de Firebase para PincelArt
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBnv7RrdRukKF5C1RB0ob02K8fRoLR7I_Q",
  authDomain: "pincelart-f7cdd.firebaseapp.com",
  projectId: "pincelart-f7cdd",
  storageBucket: "pincelart-f7cdd.firebasestorage.app",
  messagingSenderId: "933474912683",
  appId: "1:933474912683:web:89dd1cca68f463258b2aee"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Inicializar servicios de Firebase
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

// Exportar la app para uso general
export default app;
