// Servicio Firebase para PincelArt
class FirebaseService {
    constructor() {
        this.db = null;
        this.auth = null;
        this.initialized = false;
        this.init();
    }

    async init() {
        try {
            // Verificar si Firebase está disponible
            if (typeof firebase === 'undefined') {
                console.warn('Firebase no está disponible, usando localStorage');
                return;
            }

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
            firebase.initializeApp(firebaseConfig);
            this.db = firebase.firestore();
            this.auth = firebase.auth();
            this.storage = firebase.storage();
            this.initialized = true;
            
            console.log('✅ Firebase inicializado correctamente');
        } catch (error) {
            console.error('❌ Error inicializando Firebase:', error);
            this.initialized = false;
        }
    }

    // Métodos para usuarios
    async saveUser(userData) {
        if (!this.initialized) {
            return this.saveUserLocalStorage(userData);
        }

        try {
            const userRef = this.db.collection('usuarios').doc(userData.id);
            await userRef.set({
                ...userData,
                fechaModificacion: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Usuario guardado en Firebase');
            return { success: true };
        } catch (error) {
            console.error('❌ Error guardando usuario en Firebase:', error);
            return this.saveUserLocalStorage(userData);
        }
    }

    async getUser(userId) {
        if (!this.initialized) {
            return this.getUserLocalStorage(userId);
        }

        try {
            const userDoc = await this.db.collection('usuarios').doc(userId).get();
            if (userDoc.exists) {
                return { success: true, data: userDoc.data() };
            } else {
                return { success: false, error: 'Usuario no encontrado' };
            }
        } catch (error) {
            console.error('❌ Error obteniendo usuario de Firebase:', error);
            return this.getUserLocalStorage(userId);
        }
    }

    async getAllUsers() {
        if (!this.initialized) {
            return this.getAllUsersLocalStorage();
        }

        try {
            const usersSnapshot = await this.db.collection('usuarios').get();
            const users = [];
            usersSnapshot.forEach(doc => {
                users.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, data: users };
        } catch (error) {
            console.error('❌ Error obteniendo usuarios de Firebase:', error);
            return this.getAllUsersLocalStorage();
        }
    }

    // Métodos para productos
    async saveProduct(productData) {
        if (!this.initialized) {
            return this.saveProductLocalStorage(productData);
        }

        try {
            const productRef = this.db.collection('productos').doc(productData.id);
            await productRef.set({
                ...productData,
                fechaModificacion: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Producto guardado en Firebase');
            return { success: true };
        } catch (error) {
            console.error('❌ Error guardando producto en Firebase:', error);
            return this.saveProductLocalStorage(productData);
        }
    }

    // Métodos para Firebase Storage (imágenes)
    async uploadImage(file, productId) {
        if (!this.initialized) {
            throw new Error('Firebase no está inicializado');
        }

        try {
            console.log('🖼️ Subiendo imagen a Firebase Storage...');
            
            // Crear referencia al archivo en Storage
            const fileName = `productos/${productId}/${Date.now()}_${file.name}`;
            const storageRef = this.storage.ref().child(fileName);
            
            // Subir archivo
            const uploadTask = storageRef.put(file);
            
            // Esperar a que termine la subida
            const snapshot = await uploadTask;
            
            // Obtener URL de descarga
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            console.log('✅ Imagen subida exitosamente:', downloadURL);
            return downloadURL;
            
        } catch (error) {
            console.error('❌ Error subiendo imagen:', error);
            throw error;
        }
    }

    async deleteImage(imageUrl) {
        if (!this.initialized) {
            throw new Error('Firebase no está inicializado');
        }

        try {
            console.log('🗑️ Eliminando imagen de Firebase Storage...');
            
            // Crear referencia desde la URL
            const imageRef = this.storage.refFromURL(imageUrl);
            
            // Eliminar archivo
            await imageRef.delete();
            
            console.log('✅ Imagen eliminada exitosamente');
            return { success: true };
            
        } catch (error) {
            console.error('❌ Error eliminando imagen:', error);
            throw error;
        }
    }

    async getAllProducts() {
        if (!this.initialized) {
            return this.getAllProductsLocalStorage();
        }

        try {
            const productsSnapshot = await this.db.collection('productos').get();
            const products = [];
            productsSnapshot.forEach(doc => {
                products.push({ id: doc.id, ...doc.data() });
            });
            return { success: true, data: products };
        } catch (error) {
            console.error('❌ Error obteniendo productos de Firebase:', error);
            return this.getAllProductsLocalStorage();
        }
    }

    // Métodos para ventas
    async saveSale(saleData) {
        if (!this.initialized) {
            return this.saveSaleLocalStorage(saleData);
        }

        try {
            const saleRef = this.db.collection('ventas').doc();
            await saleRef.set({
                ...saleData,
                fechaCreacion: firebase.firestore.FieldValue.serverTimestamp()
            });
            console.log('✅ Venta guardada en Firebase');
            return { success: true, id: saleRef.id };
        } catch (error) {
            console.error('❌ Error guardando venta en Firebase:', error);
            return this.saveSaleLocalStorage(saleData);
        }
    }

    // Métodos de fallback para localStorage
    saveUserLocalStorage(userData) {
        try {
            const users = JSON.parse(localStorage.getItem('pincelart_users')) || [];
            const userIndex = users.findIndex(u => u.id === userData.id);
            
            if (userIndex !== -1) {
                users[userIndex] = { ...users[userIndex], ...userData };
            } else {
                users.push(userData);
            }
            
            localStorage.setItem('pincelart_users', JSON.stringify(users));
            console.log('✅ Usuario guardado en localStorage');
            return { success: true };
        } catch (error) {
            console.error('❌ Error guardando usuario en localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    getUserLocalStorage(userId) {
        try {
            const users = JSON.parse(localStorage.getItem('pincelart_users')) || [];
            const user = users.find(u => u.id === userId);
            return { success: !!user, data: user };
        } catch (error) {
            console.error('❌ Error obteniendo usuario de localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    getAllUsersLocalStorage() {
        try {
            const users = JSON.parse(localStorage.getItem('pincelart_users')) || [];
            return { success: true, data: users };
        } catch (error) {
            console.error('❌ Error obteniendo usuarios de localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    saveProductLocalStorage(productData) {
        try {
            const products = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
            const productIndex = products.findIndex(p => p.id === productData.id);
            
            if (productIndex !== -1) {
                products[productIndex] = { ...products[productIndex], ...productData };
            } else {
                products.push(productData);
            }
            
            localStorage.setItem('pincelart_productos', JSON.stringify(products));
            console.log('✅ Producto guardado en localStorage');
            return { success: true };
        } catch (error) {
            console.error('❌ Error guardando producto en localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    getAllProductsLocalStorage() {
        try {
            const products = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
            return { success: true, data: products };
        } catch (error) {
            console.error('❌ Error obteniendo productos de localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    saveSaleLocalStorage(saleData) {
        try {
            const sales = JSON.parse(localStorage.getItem('pincelart_ventas')) || [];
            const saleId = Date.now().toString();
            sales.push({ id: saleId, ...saleData });
            localStorage.setItem('pincelart_ventas', JSON.stringify(sales));
            console.log('✅ Venta guardada en localStorage');
            return { success: true, id: saleId };
        } catch (error) {
            console.error('❌ Error guardando venta en localStorage:', error);
            return { success: false, error: error.message };
        }
    }

    // Método para sincronizar datos
    async syncData() {
        if (!this.initialized) {
            console.log('Firebase no disponible, usando localStorage');
            return;
        }

        try {
            console.log('🔄 Sincronizando datos con Firebase...');
            
            // Sincronizar usuarios
            const usersResult = await this.getAllUsersLocalStorage();
            if (usersResult.success) {
                for (const user of usersResult.data) {
                    await this.saveUser(user);
                }
            }

            // Sincronizar productos
            const productsResult = await this.getAllProductsLocalStorage();
            if (productsResult.success) {
                for (const product of productsResult.data) {
                    await this.saveProduct(product);
                }
            }

            console.log('✅ Sincronización completada');
        } catch (error) {
            console.error('❌ Error en sincronización:', error);
        }
    }
}

// Crear instancia global del servicio
window.firebaseService = new FirebaseService();

// Exportar para uso en otros archivos
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirebaseService;
}