// ⚠️ ARCHIVO DE EJEMPLO - Copia esto y renómbralo a firebase-service.js

class FirebaseService {
    constructor() {
        this.db = null;
        this.auth = null;
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            if (typeof firebase === 'undefined') {
                console.warn('Firebase no está disponible');
                return;
            }

            // ⚠️ IMPORTANTE: Reemplaza con tus credenciales reales
            const firebaseConfig = {
                apiKey: "TU_API_KEY_AQUI",
                authDomain: "tu-proyecto.firebaseapp.com",
                projectId: "tu-proyecto-id",
                storageBucket: "tu-proyecto.firebasestorage.app",
                messagingSenderId: "123456789",
                appId: "1:123456789:web:abc123def456"
            };

            firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.storage = firebase.storage();
            this.initialized = true;
            
            console.log('✅ Firebase inicializado');
        } catch (error) {
            console.error('❌ Error:', error);
            this.initialized = false;
        }
    }
}

window.firebaseService = new FirebaseService();

