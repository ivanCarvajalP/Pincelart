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
                apiKey: "AIzaSyBnv7RrdRukKF5C1RB0ob02K8fRoLR7I_Q",
                authDomain: "pincelart-f7cdd.firebaseapp.com",
                projectId: "pincelart-f7cdd",
                storageBucket: "pincelart-f7cdd.firebasestorage.app",
                messagingSenderId: "933474912683",
                appId: "1:933474912683:web:89dd1cca68f463258b2aee"
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

    async deleteUser(userId) {
        if (!this.initialized) {
            return this.deleteUserLocalStorage(userId);
        }

        try {
            await this.db.collection('usuarios').doc(userId).delete();
            console.log('✅ Usuario eliminado de Firebase');
            return { success: true };
        } catch (error) {
            console.error('❌ Error eliminando usuario de Firebase:', error);
            return this.deleteUserLocalStorage(userId);
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
            const productsSnapshot = await this.db.collection('productos').orderBy('fechaCreacion', 'desc').get();
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

    async addProduct(producto) {
        if (!this.initialized) {
            return this.saveProductLocalStorage(producto);
        }

        try {
            // Si el producto ya tiene un ID, usarlo; si no, crear uno nuevo
            const productoId = producto.id || this.db.collection('productos').doc().id;
            
            // Guardar en Firebase con el ID especificado
            await this.db.collection('productos').doc(productoId).set({
                ...producto,
                id: productoId, // Asegurar que el ID esté en los datos
                fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
                fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log('✅ Producto agregado en Firebase con ID:', productoId);
            return { success: true, id: productoId };
        } catch (error) {
            console.error('❌ Error agregando producto a Firebase:', error);
            return this.saveProductLocalStorage(producto);
        }
    }

    async getProduct(productId) {
        if (!this.initialized) {
            const products = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
            const product = products.find(p => p.id === productId);
            return { success: !!product, data: product };
        }

        try {
            const doc = await this.db.collection('productos').doc(productId).get();
            if (doc.exists) {
                return { success: true, data: { id: doc.id, ...doc.data() } };
            } else {
                return { success: false, error: 'Producto no encontrado' };
            }
        } catch (error) {
            console.error('❌ Error obteniendo producto:', error);
            return { success: false, error: error.message };
        }
    }

    async updateProduct(productId, datosActualizados) {
        if (!this.initialized) {
            const products = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
            const productIndex = products.findIndex(p => p.id === productId);
            if (productIndex !== -1) {
                products[productIndex] = { ...products[productIndex], ...datosActualizados };
                localStorage.setItem('pincelart_productos', JSON.stringify(products));
                return { success: true };
            }
            return { success: false, error: 'Producto no encontrado' };
        }

        try {
            const docRef = this.db.collection('productos').doc(productId);
            
            // Usar set con merge para crear o actualizar
            await docRef.set({
                ...datosActualizados,
                fechaActualizacion: new Date().toISOString()
            }, { merge: true });
            
            console.log('✅ Producto actualizado/creado en Firebase:', productId);
            
            // Devolver éxito
            return { success: true };
        } catch (error) {
            console.error('❌ Error actualizando producto:', error);
            return { success: false, error: error.message };
        }
    }

    async deleteProduct(productId) {
        if (!this.initialized) {
            const products = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
            const productsActualizados = products.filter(p => p.id !== productId);
            localStorage.setItem('pincelart_productos', JSON.stringify(productsActualizados));
            return { success: true };
        }

        try {
            await this.db.collection('productos').doc(productId).delete();
            console.log('✅ Producto eliminado:', productId);
            return { success: true };
        } catch (error) {
            console.error('❌ Error eliminando producto:', error);
            return { success: false, error: error.message };
        }
    }

    // Listeners en tiempo real para sincronización automática
    onProductosChange(callback) {
        if (!this.initialized) {
            console.warn('⚠️ Firebase no disponible, usando eventos de localStorage');
            // Crear listener para cambios en localStorage
            const originalSetItem = Storage.prototype.setItem;
            Storage.prototype.setItem = function(key, value) {
                originalSetItem.apply(this, arguments);
                if (key === 'pincelart_productos') {
                    callback(null, JSON.parse(value));
                }
            };
            return;
        }

        try {
            console.log('👂 Configurando listener en tiempo real de productos...');
            
            this.db.collection('productos').onSnapshot(
                (snapshot) => {
                    console.log('🔥 Cambio detectado en Firebase productos');
                    const productos = [];
                    snapshot.forEach(doc => {
                        productos.push({ id: doc.id, ...doc.data() });
                    });
                    
                    // Actualizar localStorage
                    localStorage.setItem('pincelart_productos', JSON.stringify(productos));
                    
                    // Disparar evento personalizado
                    window.dispatchEvent(new CustomEvent('productos-actualizados', { 
                        detail: { productos } 
                    }));
                    
                    // Llamar al callback
                    callback(null, productos);
                },
                (error) => {
                    console.error('❌ Error en listener de productos:', error);
                    callback(error, null);
                }
            );
        } catch (error) {
            console.error('❌ Error configurando listener:', error);
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

    deleteUserLocalStorage(userId) {
        try {
            const users = JSON.parse(localStorage.getItem('pincelart_users')) || [];
            const filteredUsers = users.filter(u => u.id !== userId);
            localStorage.setItem('pincelart_users', JSON.stringify(filteredUsers));
            console.log('✅ Usuario eliminado de localStorage');
            return { success: true };
        } catch (error) {
            console.error('❌ Error eliminando usuario de localStorage:', error);
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