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
        console.log('🔥 [GETALL] getAllProducts llamado');
        
        if (!this.initialized) {
            console.log('⚠️ [GETALL] Firebase no inicializado, usando localStorage');
            return this.getAllProductsLocalStorage();
        }

        try {
            console.log('🔥 [GETALL] Obteniendo productos de Firebase...');
            const productsSnapshot = await this.db.collection('productos').orderBy('fechaCreacion', 'desc').get();
            const products = [];
            productsSnapshot.forEach(doc => {
                const productData = doc.data();
                // CRÍTICO: Sobrescribir el ID con el ID del documento
                products.push({ ...productData, id: doc.id });
            });
            console.log(`🔥 [GETALL] Productos obtenidos de Firebase: ${products.length}`);
            console.log(`🔥 [GETALL] IDs de productos:`, products.map(p => p.id));
            return { success: true, data: products };
        } catch (error) {
            console.error('❌ Error obteniendo productos de Firebase:', error);
            return this.getAllProductsLocalStorage();
        }
    }

    async addProduct(producto) {
        // SOLO Firebase - no usar localStorage como fallback
        if (!this.initialized) {
            console.error('❌ Firebase no inicializado - no se puede crear producto');
            return { success: false, error: 'Firebase no está disponible' };
        }

        try {
            // CRÍTICO: Usar el ID que viene en el producto
            const productoId = producto.id || this.db.collection('productos').doc().id;
            
            console.log(`🔥 [CREATE] Creando producto en Firebase con ID vamos a usar: ${productoId}`);
            console.log(`📋 [CREATE] Datos del producto:`, {
                id: productoId,
                nombre: producto.nombre,
                categoria: producto.categoria,
                estado: producto.estado
            });
            console.log(`🔍 [CREATE] ID del producto: "${producto.id}", ID del documento: "${productoId}"`);
            
            // Guardar en Firebase con el ID especificado
            await this.db.collection('productos').doc(productoId).set({
                ...producto,
                id: productoId, // Asegurar que el ID esté en los datos
                fechaCreacion: firebase.firestore.FieldValue.serverTimestamp(),
                fechaActualizacion: firebase.firestore.FieldValue.serverTimestamp()
            });
            
            console.log(`✅ [CREATE] Producto agregado en Firebase con ID: ${productoId}`);
            
            // El listener de Firebase actualizará localStorage automáticamente
            
            return { success: true, id: productoId };
        } catch (error) {
            console.error('❌ [CREATE] Error agregando producto a Firebase:', error);
            console.error('❌ [CREATE] Stack:', error.stack);
            return { success: false, error: error.message };
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
        console.log('✏️ [UPDATE] Firebase updateProduct llamado con ID:', productId);
        console.log('✏️ [UPDATE] Tipo de ID:', typeof productId);
        console.log('✏️ [UPDATE] Datos a actualizar:', datosActualizados);
        
        // SOLO Firebase - no usar localStorage
        if (!this.initialized) {
            console.error('❌ [UPDATE] Firebase no inicializado - no se puede actualizar producto');
            return { success: false, error: 'Firebase no está disponible' };
        }

        try {
            const docRef = this.db.collection('productos').doc(productId);
            console.log(`🔍 [UPDATE] Referencia del documento: productos/${productId}`);
            
            // Obtener los datos completos del producto actual
            const docSnap = await docRef.get();
            let datosCompletos = {};
            
            if (docSnap.exists) {
                // Si existe, ACTUALIZAR solo los campos que cambiaron
                console.log('📋 [UPDATE] Producto encontrado en Firebase, actualizando SOLO campos modificados...');
                console.log('📋 [UPDATE] Datos actuales en Firebase:', docSnap.data());
                
                // IMPORTANTE: NO incluir el campo 'id' en la actualización para evitar crear duplicados
                const { id, ...datosSinId } = datosActualizados;
                
                // Usar UPDATE para solo modificar los campos específicos (sin el ID)
                const datosUpdate = {
                    ...datosSinId,
                    fechaActualizacion: new Date().toISOString()
                };
                
                console.log('📦 [UPDATE] Datos a actualizar SOLO (sin ID):', datosUpdate);
                
                await docRef.update(datosUpdate);
                console.log(`✅ [UPDATE] Producto ACTUALIZADO en Firebase: ${productId}`);
            } else {
                // Si no existe, NO crear nuevo para evitar duplicados
                console.error('❌ [UPDATE] Producto NO existe en Firebase con ID:', productId);
                console.error('❌ [UPDATE] NO se creará un duplicado. El producto debe existir antes de poder actualizarlo.');
                return { success: false, error: 'Producto no encontrado en Firebase' };
            }
            
            // NO actualizar localStorage manualmente
            // El listener onSnapshot se encargará de sincronizar automáticamente
            
            return { success: true };
        } catch (error) {
            console.error('❌ [UPDATE] Error actualizando producto:', error);
            console.error('❌ [UPDATE] Stack:', error.stack);
            return { success: false, error: error.message };
        }
    }

    async deleteProduct(productId) {
        console.log('🗑️ Firebase deleteProduct llamado con ID:', productId);
        console.log('🔍 Tipo de ID:', typeof productId);
        console.log('🔍 ID específico:', JSON.stringify(productId));
        
        if (!this.initialized) {
            console.log('⚠️ Firebase no inicializado, eliminando solo de localStorage');
            const products = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
            const productsActualizados = products.filter(p => p.id !== productId);
            localStorage.setItem('pincelart_productos', JSON.stringify(productsActualizados));
            return { success: true };
        }

        try {
            console.log(`🔥 [DELETE] Intentando eliminar documento: productos/${productId}`);
            
            const docRef = this.db.collection('productos').doc(productId);
            
            // Verificar si el documento existe antes de eliminar
            const docSnapshot = await docRef.get();
            console.log(`📋 [DELETE] ¿Documento existe?:`, docSnapshot.exists);
            
            if (!docSnapshot.exists) {
                console.warn(`⚠️ [DELETE] El documento ${productId} no existe en Firebase`);
                console.log('🔍 [DELETE] Buscando el documento por nombre...');
                
                // Intentar buscar por nombre
                const allProducts = await this.db.collection('productos').get();
                allProducts.forEach(doc => {
                    const data = doc.data();
                    if (data.nombre && data.nombre.toLowerCase().includes('cargador')) {
                        console.log(`🔍 [DELETE] Encontrado por nombre: ${doc.id} - ${data.nombre}`);
                    }
                });
                
                console.log('🔄 [DELETE] Eliminando solo de localStorage...');
                
                // Si no existe en Firebase, eliminar de localStorage
                const products = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
                console.log(`📦 [DELETE] Productos en localStorage: ${products.length}`);
                
                const productsActualizados = products.filter(p => p.id !== productId);
                console.log(`📦 [DELETE] Productos después de filtrar: ${productsActualizados.length}`);
                
                localStorage.setItem('pincelart_productos', JSON.stringify(productsActualizados));
                console.log('✅ [DELETE] Producto eliminado de localStorage');
                
                // Disparar evento para actualizar la UI
                window.dispatchEvent(new CustomEvent('productos-actualizados', { 
                    detail: { productos: productsActualizados } 
                }));
                console.log(`📢 [DELETE] Evento productos-actualizados disparado con ${productsActualizados.length} productos`);
                
                return { success: true, message: 'Eliminado de localStorage (no existía en Firebase)' };
            }
            
            console.log(`📋 [DELETE] Datos del documento antes de eliminar:`, docSnapshot.data());
            
            // SI EXISTE EN FIREBASE, ELIMINAR FORZOSAMENTE
            console.log(`🔥 [DELETE] ELIMINANDO FORZADAMENTE DE FIREBASE...`);
            
            await docRef.delete();
            console.log(`✅ [DELETE] Documento eliminado exitosamente de Firebase: ${productId}`);
            
            // El listener de Firebase se encargará de actualizar localStorage automáticamente
            
            return { success: true };
        } catch (error) {
            console.error(`❌ [DELETE] Error eliminando producto ${productId}:`, error);
            console.error(`❌ [DELETE] Stack trace:`, error.stack);
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
                    
                    // Ver cambios específicos (agregados, modificados, eliminados)
                    const cambiosDetectados = snapshot.docChanges();
                    console.log(`📊 Total cambios detectados: ${cambiosDetectados.length}`);
                    
                    cambiosDetectados.forEach((change, index) => {
                        console.log(`📊 Cambio ${index + 1}: tipo=${change.type}, id=${change.doc.id}`);
                        if (change.type === 'added') {
                            console.log('➕ Producto agregado:', change.doc.id);
                        } else if (change.type === 'modified') {
                            console.log('✏️ Producto modificado:', change.doc.id);
                        } else if (change.type === 'removed') {
                            console.log('🗑️ Producto eliminado:', change.doc.id);
                            console.log('   Datos eliminados:', change.doc.data());
                        }
                    });
                    
                    const productos = [];
                    snapshot.forEach(doc => {
                        const productData = doc.data();
                        // CRÍTICO: Usar el ID del documento como fuente de verdad
                        // Sobrescribir cualquier campo 'id' que venga en los datos
                        const producto = { ...productData, id: doc.id };
                        productos.push(producto);
                    });
                    
                    console.log(`📦 Total productos en Firebase: ${productos.length}`);
                    console.log(`📦 IDs de productos en Firebase:`, productos.map(p => `${p.nombre}(${p.id})`));
                    
                    // Actualizar localStorage con los productos de Firebase
                    localStorage.setItem('pincelart_productos', JSON.stringify(productos));
                    console.log('✅ localStorage actualizado con productos de Firebase');
                    
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