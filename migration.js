// Script de migración de datos de LocalStorage a Firebase
// Este script migra todos los datos existentes a la base de datos Firebase

import { 
    collection, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

class DataMigration {
    constructor(db) {
        this.db = db;
    }

    async migrarTodosLosDatos() {
        console.log("🚀 Iniciando migración de datos a Firebase...");
        
        try {
            // Migrar usuarios/vendedores
            await this.migrarUsuarios();
            
            // Migrar productos
            await this.migrarProductos();
            
            // Migrar ventas
            await this.migrarVentas();
            
            console.log("✅ Migración completada exitosamente!");
            return true;
        } catch (error) {
            console.error("❌ Error en la migración:", error);
            return false;
        }
    }

    async migrarUsuarios() {
        const usuarios = JSON.parse(localStorage.getItem('pincelart_users')) || [];
        console.log(`📊 Migrando ${usuarios.length} usuarios...`);
        
        for (const usuario of usuarios) {
            try {
                // Verificar si ya existe en Firebase
                const existe = await this.verificarUsuarioExistente(usuario.email);
                if (existe) {
                    console.log(`⏭️ Usuario ${usuario.email} ya existe, saltando...`);
                    continue;
                }

                const docRef = await addDoc(collection(this.db, "usuarios"), {
                    name: usuario.name || usuario.nombre,
                    email: usuario.email,
                    password: usuario.password,
                    rol: usuario.rol || 'vendedor',
                    telefono: usuario.telefono || '',
                    direccion: usuario.direccion || '',
                    estado: usuario.estado || 'activo',
                    activo: true,
                    fechaCreacion: serverTimestamp(),
                    fechaModificacion: serverTimestamp()
                });
                
                console.log(`✅ Usuario migrado: ${usuario.email} (ID: ${docRef.id})`);
            } catch (error) {
                console.error(`❌ Error migrando usuario ${usuario.email}:`, error);
            }
        }
    }

    async migrarProductos() {
        const productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        console.log(`📊 Migrando ${productos.length} productos...`);
        
        for (const producto of productos) {
            try {
                // Verificar si ya existe en Firebase
                const existe = await this.verificarProductoExistente(producto.nombre);
                if (existe) {
                    console.log(`⏭️ Producto ${producto.nombre} ya existe, saltando...`);
                    continue;
                }

                const docRef = await addDoc(collection(this.db, "productos"), {
                    nombre: producto.nombre,
                    descripcion: producto.descripcion,
                    categoria: producto.categoria,
                    precio: producto.precio,
                    stock: producto.stock,
                    estado: producto.estado,
                    imagen: producto.imagen,
                    vendedorId: producto.vendedorId || 'admin_001',
                    activo: true,
                    fechaCreacion: serverTimestamp(),
                    fechaModificacion: serverTimestamp()
                });
                
                console.log(`✅ Producto migrado: ${producto.nombre} (ID: ${docRef.id})`);
            } catch (error) {
                console.error(`❌ Error migrando producto ${producto.nombre}:`, error);
            }
        }
    }

    async migrarVentas() {
        const ventas = JSON.parse(localStorage.getItem('pincelart_ventas')) || [];
        console.log(`📊 Migrando ${ventas.length} ventas...`);
        
        for (const venta of ventas) {
            try {
                const docRef = await addDoc(collection(this.db, "ventas"), {
                    usuarioId: venta.usuarioId,
                    productoId: venta.productoId,
                    cantidad: venta.cantidad,
                    precio: venta.precio,
                    total: venta.total,
                    fecha: venta.fecha,
                    estado: venta.estado || 'completada',
                    activo: true,
                    fechaCreacion: serverTimestamp()
                });
                
                console.log(`✅ Venta migrada: ${venta.id} (ID: ${docRef.id})`);
            } catch (error) {
                console.error(`❌ Error migrando venta ${venta.id}:`, error);
            }
        }
    }

    async verificarUsuarioExistente(email) {
        try {
            const { getDocs, query, where } = await import("https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js");
            const q = query(collection(this.db, "usuarios"), where("email", "==", email));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error verificando usuario:", error);
            return false;
        }
    }

    async verificarProductoExistente(nombre) {
        try {
            const { getDocs, query, where } = await import("https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js");
            const q = query(collection(this.db, "productos"), where("nombre", "==", nombre));
            const querySnapshot = await getDocs(q);
            return !querySnapshot.empty;
        } catch (error) {
            console.error("Error verificando producto:", error);
            return false;
        }
    }

    // Función para mostrar progreso de migración
    mostrarProgresoMigracion() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content modal-small">
                <div class="modal-header">
                    <h3>Migrando Datos</h3>
                </div>
                <div class="modal-body">
                    <div style="text-align: center;">
                        <div class="spinner" style="width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #2e7d32; border-radius: 50%; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
                        <p>Migrando datos de LocalStorage a Firebase...</p>
                        <p style="font-size: 0.9rem; color: #666;">Esto puede tomar unos momentos</p>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar estilos para el spinner
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(modal);
        
        return modal;
    }

    ocultarProgresoMigracion(modal) {
        if (modal && modal.parentNode) {
            modal.parentNode.removeChild(modal);
        }
    }
}

// Función global para iniciar migración
window.iniciarMigracion = async function() {
    if (!window.firebaseDB) {
        alert('Firebase no está inicializado. Espera un momento e intenta de nuevo.');
        return;
    }

    const migracion = new DataMigration(window.firebaseDB);
    const modalProgreso = migracion.mostrarProgresoMigracion();
    
    try {
        const resultado = await migracion.migrarTodosLosDatos();
        migracion.ocultarProgresoMigracion(modalProgreso);
        
        if (resultado) {
            alert('✅ Migración completada exitosamente!\n\nTodos los datos han sido transferidos a Firebase.');
        } else {
            alert('❌ Hubo errores durante la migración.\n\nRevisa la consola para más detalles.');
        }
    } catch (error) {
        migracion.ocultarProgresoMigracion(modalProgreso);
        console.error('Error en migración:', error);
        alert('❌ Error durante la migración.\n\nRevisa la consola para más detalles.');
    }
};

// Exportar para uso en otros archivos
export default DataMigration;
