// JavaScript SIMPLE para Panel de Administración

document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Panel de administración cargado');
    
    // Inicializar Firebase Service si no está ya inicializado
    if (!window.firebaseService) {
        try {
            const firebaseService = new FirebaseService();
            await firebaseService.init();
            window.firebaseService = firebaseService;
            console.log('🔥 Firebase Service inicializado');
            
            // Configurar listener en tiempo real para sincronización automática
            if (firebaseService && firebaseService.initialized) {
                firebaseService.onProductosChange((error, productos) => {
                    if (error) {
                        console.error('❌ Error en sincronización:', error);
                        return;
                    }
                    console.log('🔄 Productos sincronizados desde Firebase en Admin Panel:', productos.length);
                    
                    // Actualizar localStorage con los productos sincronizados
                    localStorage.setItem('pincelart_productos', JSON.stringify(productos));
                    
                    // Si el modal de gestión está abierto, actualizar la lista
                    const modalGestion = document.querySelector('.modal-productos');
                    if (modalGestion && typeof cargarProductosEnModal === 'function') {
                        console.log('🔄 Actualizando lista de gestión automáticamente...');
                        cargarProductosEnModal(modalGestion);
                    }
                    
                    // Disparar evento global para actualizar otros módulos
                    window.dispatchEvent(new CustomEvent('productos-actualizados', { 
                        detail: { productos } 
                    }));
                });
                console.log('👂 Listener de Firebase configurado en Admin Panel - Sincronización en tiempo real activa');
            }
        } catch (error) {
            console.error('❌ Error inicializando Firebase Service:', error);
        }
    } else {
        // Si firebaseService ya existe, configurar el listener
        if (window.firebaseService && window.firebaseService.initialized) {
            window.firebaseService.onProductosChange((error, productos) => {
                if (error) {
                    console.error('❌ Error en sincronización:', error);
                    return;
                }
                console.log('🔄 Productos sincronizados desde Firebase en Admin Panel:', productos.length);
                
                // Actualizar localStorage
                localStorage.setItem('pincelart_productos', JSON.stringify(productos));
                
                // Si el modal de gestión está abierto, actualizar la lista
                const modalGestion = document.querySelector('.modal-productos');
                if (modalGestion && typeof cargarProductosEnModal === 'function') {
                    console.log('🔄 Actualizando lista de gestión automáticamente...');
                    cargarProductosEnModal(modalGestion);
                }
                
                // Disparar evento global
                window.dispatchEvent(new CustomEvent('productos-actualizados', { 
                    detail: { productos } 
                }));
            });
            console.log('👂 Listener de Firebase configurado en Admin Panel (existente)');
        }
    }
    
    // Cargar información del usuario
    cargarInformacionUsuario();
    
    // Cargar estadísticas
    cargarEstadisticas();
    
    // MIGRACIÓN LIMPIA DESDE CERO - EJECUTAR ANTES DE MOSTRAR EL PANEL
    // console.log('🔧 Ejecutando migración limpia desde cero...');
    // await ejecutarMigracionLimpiaDesdeCero();
    
    // Cargar productos locales SIN MIGRACIÓN AUTOMÁTICA
    // El modal de gestión los cargará directamente de las carpetas
    
    // Ejecutar limpieza y migración automática de productos (deshabilitado temporalmente)
    // ejecutarLimpiezaYMigracionAutomatica();
    
    // Validar y limpiar productos automáticamente (deshabilitado temporalmente)
    // validarYLimpiarProductos();
    
    console.log('✅ Panel inicializado');
});

function cargarInformacionUsuario() {
    try {
        console.log('🔍 Buscando usuario en localStorage...');
        const currentUser = JSON.parse(localStorage.getItem('pincelart_current_user'));
        console.log('👤 Usuario encontrado:', currentUser);
        
        if (currentUser) {
            const userNameElement = document.getElementById('admin-user-name');
            console.log('📍 Elemento admin-user-name:', userNameElement);
            
            // Ocultar secciones según el rol (con delay para asegurar que el DOM esté listo)
            setTimeout(() => {
                console.log('⏰ Aplicando permisos con delay...');
                ocultarSeccionesSegunRol(currentUser.rol);
            }, 100);
            
            // También aplicar inmediatamente
            console.log('🚀 Aplicando permisos inmediatamente...');
            ocultarSeccionesSegunRol(currentUser.rol);
            
            if (userNameElement) {
                // Intentar ambos campos por compatibilidad
                const nombre = currentUser.nombre || currentUser.name || 'Administrador';
                userNameElement.textContent = nombre;
                console.log('✅ Nombre establecido:', nombre);
            } else {
                console.error('❌ No se encontró el elemento #admin-user-name');
            }
        } else {
            console.log('⚠️ No hay usuario logueado, redirigiendo a login...');
            // Descomentar esta línea si quieres redirigir automáticamente
            // window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('❌ Error cargando usuario:', error);
    }
}

async function cargarEstadisticas() {
    try {
        // Cargar usuarios desde localStorage
        const users = JSON.parse(localStorage.getItem('pincelart_users')) || [];
        
        // Cargar productos desde Firebase si está disponible
        let productos = [];
        if (window.firebaseService && window.firebaseService.initialized) {
            try {
                const result = await window.firebaseService.getAllProducts();
                if (result.success && result.data) {
                    productos = result.data;
                    console.log(`📊 Productos cargados desde Firebase: ${productos.length}`);
                }
            } catch (error) {
                console.warn('⚠️ Error cargando productos desde Firebase:', error);
                // Fallback a localStorage
                productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
            }
        } else {
            productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        }
        
        // Actualizar contadores
        const totalUsersElement = document.getElementById('total-users');
        const totalProductsElement = document.getElementById('total-products');
        const totalSalesElement = document.getElementById('total-sales');
        
        if (totalUsersElement) {
            totalUsersElement.textContent = users.length;
        }
        
        if (totalProductsElement) {
            totalProductsElement.textContent = productos.length;
        }
        
        if (totalSalesElement) {
            totalSalesElement.textContent = '0';
        }
        
        console.log(`✅ Estadísticas cargadas: ${users.length} usuarios, ${productos.length} productos`);
    } catch (error) {
        console.error('❌ Error cargando estadísticas:', error);
    }
}

function volverAlInicio() {
    window.location.href = 'main.html';
}

function cerrarSesionAdmin() {
    localStorage.removeItem('pincelart_current_user');
    window.location.href = 'login.html';
}

// Función para mostrar mensajes en modal
function mostrarMensaje(titulo, mensaje, tipo = 'info') {
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10001;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    const colorBoton = tipo === 'success' ? '#4caf50' : tipo === 'error' ? '#f44336' : '#1976d2';
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 10px; max-width: 400px; width: 90%; text-align: center; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="margin-bottom: 1rem;">
                <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}" 
                   style="font-size: 3rem; color: ${colorBoton}; margin-bottom: 1rem;"></i>
                <h3 style="margin: 0 0 0.5rem 0; color: #333;">${titulo}</h3>
                <p style="margin: 0; color: #666; font-size: 1rem;">${mensaje}</p>
            </div>
            <button onclick="this.parentElement.parentElement.remove()" 
                    style="padding: 0.8rem 2rem; background: ${colorBoton}; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">
                Aceptar
            </button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Función para cargar todos los productos de las carpetas locales
function obtenerTodosLosProductosLocales() {
    // Esta función lee todas las imágenes de las carpetas y genera productos
    // Por ahora, retorna un array vacío ya que la lógica está en migrar-productos-completo.js
    return [];
}

// Ejecutar limpieza y migración automática al cargar el panel (solo una vez)
let limpiezaEjecutada = false;
async function ejecutarLimpiezaYMigracionAutomatica() {
    if (limpiezaEjecutada) return;
    limpiezaEjecutada = true;
    
    console.log('🧹 Iniciando limpieza y migración automática de productos...');
    
    if (!window.firebaseService || !window.firebaseService.initialized) {
        console.log('⏳ Esperando inicialización de Firebase...');
        setTimeout(ejecutarLimpiezaYMigracionAutomatica, 1000);
        return;
    }
    
    try {
        // Limpiar productos duplicados
        console.log('🧹 Paso 1: Limpiando productos duplicados...');
        await limpiarProductosDuplicados();
        
        // Esperar un poco antes de migrar
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Verificar productos después de limpiar
        const resultado = await window.firebaseService.getAllProducts();
        console.log(`📦 Productos únicos después de limpiar: ${resultado.data.length}`);
        
        // Migrar productos nuevos
        if (resultado.data.length < 100) {
            console.log('📦 Paso 2: Migrando productos nuevos...');
            await migrarProductosNuevos();
        } else {
            console.log(`✅ Ya hay suficientes productos únicos (${resultado.data.length})`);
        }
        
    } catch (error) {
        console.error('❌ Error en limpieza y migración:', error);
    }
}

async function limpiarProductosDuplicados() {
    try {
        const resultado = await window.firebaseService.getAllProducts();
        if (!resultado.success) {
            console.error('❌ Error obteniendo productos');
            return;
        }

        const productos = resultado.data;
        console.log(`📦 Total de productos en Firebase: ${productos.length}`);

        // Buscar duplicados por imagen
        const productosUnicos = [];
        const imagenesVistas = new Set();
        const idsAEliminar = [];

        for (const producto of productos) {
            if (imagenesVistas.has(producto.imagen)) {
                // Producto duplicado, marcar para eliminar
                idsAEliminar.push(producto.id);
                console.log(`🗑️ Duplicado encontrado: ${producto.nombre} (${producto.id})`);
            } else {
                imagenesVistas.add(producto.imagen);
                productosUnicos.push(producto);
            }
        }

        console.log(`✨ Productos únicos: ${productosUnicos.length}`);
        console.log(`🗑️ Productos duplicados a eliminar: ${idsAEliminar.length}`);

        // Eliminar productos duplicados
        for (const id of idsAEliminar) {
            try {
                await window.firebaseService.deleteProduct(id);
                console.log(`✅ Eliminado producto duplicado: ${id}`);
            } catch (error) {
                console.error(`❌ Error eliminando producto ${id}:`, error);
            }
        }

        console.log(`🎉 Limpieza completada. Productos únicos: ${productosUnicos.length}`);
        return productosUnicos;

    } catch (error) {
        console.error('❌ Error en limpieza:', error);
        return [];
    }
}

// Función principal - MIGRACIÓN LIMPIA DESDE CERO
async function ejecutarMigracionLimpiaDesdeCero() {
    try {
        console.log('🔧 INICIANDO MIGRACIÓN LIMPIA DESDE CERO...');
        console.log('📋 Esto tomará unos minutos. Por favor, espere...');
        
        if (!window.firebaseService || !window.firebaseService.initialized) {
            console.log('⏳ Firebase no está listo aún');
            return;
        }
        
        // Solo ejecutar una vez
        if (window.migracionCompletaEjecutada) {
            console.log('⏭️ Migración ya completada anteriormente');
            return;
        }
        
        if (!window.obtenerProductosLocales) {
            console.log('⏳ Esperando script de migración...');
            return;
        }
        
        // ==========================================
        // PASO 1: ELIMINAR TODOS LOS PRODUCTOS
        // ==========================================
        console.log('\n🗑️ PASO 1: Eliminando TODOS los productos...');
        
        let productosActuales = await window.firebaseService.getAllProducts();
        let totalEliminados = 0;
        
        // Eliminar en lotes hasta que no quede nada
        let intentos = 0;
        while (productosActuales.data.length > 0 && intentos < 15) {
            console.log(`   Eliminando lote ${intentos + 1}: ${productosActuales.data.length} productos`);
            
            for (const producto of productosActuales.data) {
                try {
                    await window.firebaseService.deleteProduct(producto.id);
                    totalEliminados++;
                } catch (error) {
                    console.error(`Error eliminando ${producto.id}:`, error);
                }
            }
            
            await new Promise(resolve => setTimeout(resolve, 500));
            productosActuales = await window.firebaseService.getAllProducts();
            intentos++;
        }
        
        console.log(`✅ ${totalEliminados} productos eliminados de Firebase`);
        
        // Limpiar localStorage
        localStorage.setItem('pincelart_productos', JSON.stringify([]));
        console.log('✅ localStorage limpiado');
        
        // ==========================================
        // PASO 2: OBTENER Y ORGANIZAR PRODUCTOS UNICOS
        // ==========================================
        console.log('\n📦 PASO 2: Obteniendo productos de las carpetas...');
        
        const productosLocales = window.obtenerProductosLocales();
        console.log(`   Total de productos en carpetas: ${productosLocales.length}`);
        
        // Crear mapa de productos únicos por imagen (evitar duplicados)
        const mapProductosUnicos = new Map();
        
        for (const producto of productosLocales) {
            // Usar la ruta de imagen como clave única
            if (!mapProductosUnicos.has(producto.imagen)) {
                mapProductosUnicos.set(producto.imagen, producto);
            } else {
                console.log(`   ⏭️ Duplicado ignorado: ${producto.nombre}`);
            }
        }
        
        const productosUnicos = Array.from(mapProductosUnicos.values());
        console.log(`   ✨ Productos únicos para migrar: ${productosUnicos.length}`);
        
        // ==========================================
        // PASO 3: MIGRAR PRODUCTOS
        // ==========================================
        console.log('\n🔥 PASO 3: Migrando productos a Firebase...');
        console.log(`   Progreso: 0/${productosUnicos.length}`);
        
        let migrados = 0;
        for (const producto of productosUnicos) {
            try {
                const productoConTimestamps = {
                    ...producto,
                    fechaCreacion: new Date().toISOString(),
                    fechaActualizacion: new Date().toISOString()
                };
                
                await window.firebaseService.addProduct(productoConTimestamps);
                migrados++;
                
                if (migrados % 25 === 0 || migrados === productosUnicos.length) {
                    console.log(`   ✅ Migrados: ${migrados}/${productosUnicos.length}`);
                }
            } catch (error) {
                console.error(`❌ Error migrando ${producto.nombre}:`, error);
            }
        }
        
        // ==========================================
        // PASO 4: VERIFICAR Y SINCRONIZAR
        // ==========================================
        console.log('\n💾 PASO 4: Verificando y sincronizando...');
        
        const productosVerificacion = await window.firebaseService.getAllProducts();
        
        if (productosVerificacion.success) {
            localStorage.setItem('pincelart_productos', JSON.stringify(productosVerificacion.data));
            
            console.log('\n🎉 MIGRACIÓN COMPLETADA');
            console.log(`   • Eliminados: ${totalEliminados}`);
            console.log(`   • Migrados: ${migrados}`);
            console.log(`   • Total en Firebase: ${productosVerificacion.data.length}`);
            
            if (productosVerificacion.data.length !== migrados) {
                console.error('❌ INCONSISTENCIA DETECTADA!');
                console.error(`   Esperado: ${migrados}`);
                console.error(`   Encontrado: ${productosVerificacion.data.length}`);
            } else {
                console.log('✅ Todos los productos sincronizados correctamente');
            }
        }
        
        // Marcar como completado
        window.migracionCompletaEjecutada = true;
        
        console.log('\n✅ Migración finalizada. El panel está listo.');
        
    } catch (error) {
        console.error('❌ Error en migración:', error);
    }
}

// Función antigua - mantener por compatibilidad
async function ejecutarMigracionLimpiaAutomatica() {
    try {
        console.log('🔧 MIGRACIÓN LIMPIA DESDE CERO...');
        
        if (!window.firebaseService || !window.firebaseService.initialized) {
            console.log('⏳ Firebase no está listo aún');
            return;
        }
        
        // Solo ejecutar una vez (usar flag)
        if (window.migracionLimpiaEjecutada) {
            console.log('⏭️ Migración limpia ya ejecutada anteriormente');
            return;
        }
        
        // Cargar script de migración si existe
        if (typeof window.obtenerProductosLocales === 'function') {
            console.log('✅ Función de productos locales disponible');
            
            // ==========================================
            // PASO 1: ELIMINAR TODOS LOS PRODUCTOS
            // ==========================================
            console.log('\n🗑️ PASO 1: Eliminando TODOS los productos de Firebase...');
            
            let productosParaEliminar = await window.firebaseService.getAllProducts();
            let totalEliminados = 0;
            
            // Eliminar en lotes hasta que no quede nada
            let intentos = 0;
            while (productosParaEliminar.data.length > 0 && intentos < 10) {
                console.log(`   Intento ${intentos + 1}: ${productosParaEliminar.data.length} productos a eliminar`);
                
                for (const producto of productosParaEliminar.data) {
                    try {
                        await window.firebaseService.deleteProduct(producto.id);
                        totalEliminados++;
                    } catch (error) {
                        console.error(`Error eliminando ${producto.id}:`, error);
                    }
                }
                
                // Esperar un poco
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Verificar si quedan productos
                productosParaEliminar = await window.firebaseService.getAllProducts();
                intentos++;
            }
            
            console.log(`✅ ${totalEliminados} productos eliminados de Firebase`);
            
            // Limpiar localStorage también
            localStorage.setItem('pincelart_productos', JSON.stringify([]));
            console.log('✅ localStorage limpiado');
            
            // ==========================================
            // PASO 2: OBTENER PRODUCTOS LOCALES SIN DUPLICADOS
            // ==========================================
            console.log('\n📦 PASO 2: Obteniendo productos locales...');
            
            const productosLocales = window.obtenerProductosLocales();
            console.log(`   Total en carpeta: ${productosLocales.length}`);
            
            // Filtrar duplicados EXACTOS (misma imagen)
            const imagenesVistas = new Map();
            const productosUnicos = [];
            
            for (const producto of productosLocales) {
                if (!imagenesVistas.has(producto.imagen)) {
                    imagenesVistas.set(producto.imagen, producto);
                    productosUnicos.push(producto);
                } else {
                    console.log(`   ⏭️ Duplicado ignorado: ${producto.nombre}`);
                }
            }
            
            console.log(`   ✨ Productos únicos: ${productosUnicos.length}`);
            
            // ==========================================
            // PASO 3: MIGRAR PRODUCTOS ÚNICOS
            // ==========================================
            console.log('\n🔥 PASO 3: Migrando productos únicos...');
            
            let migrados = 0;
            for (const producto of productosUnicos) {
                try {
                    const productoConTimestamps = {
                        ...producto,
                        fechaCreacion: new Date().toISOString(),
                        fechaActualizacion: new Date().toISOString()
                    };
                    
                    await window.firebaseService.addProduct(productoConTimestamps);
                    migrados++;
                    
                    if (migrados % 20 === 0) {
                        console.log(`   Migrados: ${migrados}/${productosUnicos.length}`);
                    }
                } catch (error) {
                    console.error(`Error migrando ${producto.nombre}:`, error);
                }
            }
            
            console.log(`✅ ${migrados} productos migrados`);
            
            // ==========================================
            // PASO 4: SINCRONIZAR CON LOCALSTORAGE
            // ==========================================
            console.log('\n💾 PASO 4: Sincronizando localStorage...');
            
            const productosFinales = await window.firebaseService.getAllProducts();
            if (productosFinales.success && productosFinales.data.length === migrados) {
                localStorage.setItem('pincelart_productos', JSON.stringify(productosFinales.data));
                console.log(`✅ localStorage sincronizado: ${productosFinales.data.length} productos`);
            } else {
                console.error(`❌ INCONSISTENCIA: Esperado ${migrados}, encontrado ${productosFinales.data.length}`);
            }
            
            console.log('\n🎉 MIGRACIÓN LIMPIA COMPLETADA');
            console.log(`   Total eliminados: ${totalEliminados}`);
            console.log(`   Total migrados: ${migrados}`);
            console.log(`   Total en Firebase: ${productosFinales.data.length}`);
            
            // Marcar como ejecutado
            window.migracionLimpiaEjecutada = true;
            
        } else {
            console.log('⚠️ Función obtenerProductosLocales no disponible');
        }
        
    } catch (error) {
        console.error('❌ Error en migración limpia:', error);
    }
}

// Función para corregir imágenes inválidas en Firebase
async function corregirImagenesInvalidasEnFirebase() {
    try {
        console.log('🔧 VERIFICANDO y limpiando productos con logo/duplicados...');
        
        if (!window.firebaseService || !window.firebaseService.initialized) {
            console.log('⏳ Firebase no está listo aún');
            return;
        }
        
        const resultado = await window.firebaseService.getAllProducts();
        if (!resultado.success) return;
        
        const productos = resultado.data;
        
        // 1. Eliminar productos con logo
        const productosConLogo = productos.filter(p => 
            p.imagen && p.imagen.toLowerCase().includes('logo')
        );
        
        // 2. Detectar duplicados por imagen
        const imagenesVistas = new Map();
        const duplicados = [];
        
        productos.forEach(producto => {
            if (producto.imagen && !producto.imagen.toLowerCase().includes('logo')) {
                if (imagenesVistas.has(producto.imagen)) {
                    duplicados.push(producto);
                } else {
                    imagenesVistas.set(producto.imagen, producto.id);
                }
            }
        });
        
        const idsAEliminar = [
            ...productosConLogo.map(p => p.id),
            ...duplicados.map(p => p.id)
        ];
        
        if (idsAEliminar.length === 0) {
            console.log('✅ No hay productos para limpiar');
            return;
        }
        
        console.log(`🗑️ Eliminando ${idsAEliminar.length} productos inválidos/duplicados...`);
        console.log(`   - Con logo: ${productosConLogo.length}`);
        console.log(`   - Duplicados: ${duplicados.length}`);
        
        for (const id of idsAEliminar) {
            try {
                await window.firebaseService.deleteProduct(id);
                console.log(`✅ Eliminado: ${id}`);
            } catch (error) {
                console.error(`❌ Error eliminando ${id}:`, error);
            }
        }
        
        // Actualizar localStorage
        const productosFinales = await window.firebaseService.getAllProducts();
        if (productosFinales.success) {
            localStorage.setItem('pincelart_productos', JSON.stringify(productosFinales.data));
            console.log('✅ localStorage actualizado');
        }
        
        console.log(`🎉 Limpieza completada: ${idsAEliminar.length} productos eliminados`);
        
    } catch (error) {
        console.error('❌ Error en corrección:', error);
    }
}

// Función para validar y limpiar productos sin nombre o imagen
async function validarYLimpiarProductos() {
    try {
        console.log('🔍 Validando productos (nombre, imagen, duplicados)...');
        
        // Obtener productos de Firebase
        const resultado = await window.firebaseService.getAllProducts();
        if (!resultado.success) {
            console.error('❌ Error obteniendo productos de Firebase');
            return;
        }
        
        const productos = resultado.data;
        console.log(`📦 Total de productos: ${productos.length}`);
        
        // Validar productos
        const productosValidos = [];
        const productosInvalidos = [];
        const productosSinImagen = [];
        const productosSinNombre = [];
        
        for (const producto of productos) {
            const tieneNombre = producto.nombre && producto.nombre.trim() !== '';
            const tieneImagen = producto.imagen && producto.imagen.trim() !== '';
            // CRÍTICO: Validar que NO sea el logo
            const imagenValida = tieneImagen && !producto.imagen.toLowerCase().includes('logo');
            
            if (!tieneNombre) {
                productosSinNombre.push(producto.id);
            }
            
            if (!imagenValida) {
                productosSinImagen.push(producto.id);
            }
            
            if (tieneNombre && imagenValida) {
                productosValidos.push(producto);
            } else {
                productosInvalidos.push(producto.id);
            }
        }
        
        console.log(`✅ Productos válidos (con nombre e imagen): ${productosValidos.length}`);
        console.log(`❌ Productos sin nombre: ${productosSinNombre.length}`);
        console.log(`❌ Productos sin imagen: ${productosSinImagen.length}`);
        
        // Eliminar productos inválidos
        for (const id of productosInvalidos) {
            try {
                await window.firebaseService.deleteProduct(id);
                console.log(`🗑️ Eliminado producto inválido: ${id}`);
            } catch (error) {
                console.error(`❌ Error eliminando producto ${id}:`, error);
            }
        }
        
        // Buscar y eliminar duplicados por imagen
        const imagenesVistas = new Map();
        const duplicadosPorImagen = [];
        
        for (const producto of productosValidos) {
            if (imagenesVistas.has(producto.imagen)) {
                // Duplicado encontrado, eliminar este (mantener el primero)
                duplicadosPorImagen.push(producto.id);
                console.log(`🗑️ Duplicado por imagen: ${producto.nombre} (${producto.id})`);
            } else {
                imagenesVistas.set(producto.imagen, producto.id);
            }
        }
        
        // Eliminar duplicados
        for (const id of duplicadosPorImagen) {
            try {
                await window.firebaseService.deleteProduct(id);
                console.log(`🗑️ Eliminado producto duplicado: ${id}`);
            } catch (error) {
                console.error(`❌ Error eliminando producto duplicado ${id}:`, error);
            }
        }
        
        console.log(`🎉 Validación completada. Productos válidos y únicos: ${productosValidos.length - duplicadosPorImagen.length}`);
        
        // Sincronizar con localStorage
        if (productosInvalidos.length > 0 || duplicadosPorImagen.length > 0) {
            console.log('🔄 Sincronizando localStorage con Firebase...');
            const productosFinales = await window.firebaseService.getAllProducts();
            if (productosFinales.success) {
                localStorage.setItem('pincelart_productos', JSON.stringify(productosFinales.data));
                console.log('✅ localStorage sincronizado');
            }
        }
        
    } catch (error) {
        console.error('❌ Error en validación:', error);
    }
}

async function migrarProductosNuevos() {
    try {
        console.log('🚀 Iniciando migración de productos...');
        
        // Cargar script de migración
        const script = document.createElement('script');
        script.src = 'migrar-productos-completo.js';
        document.head.appendChild(script);
        
        // Ejecutar migración después de cargar el script
        setTimeout(async () => {
            if (typeof window.migrarProductosAFirebase === 'function') {
                await window.migrarProductosAFirebase();
            }
        }, 1000);
        
    } catch (error) {
        console.error('❌ Error en migración:', error);
    }
}

// Función para ocultar secciones según el rol
function ocultarSeccionesSegunRol(rol) {
    console.log('🔐 Configurando permisos para rol:', rol);
    
    // Obtener todas las secciones
    const allSections = document.querySelectorAll('.admin-section');
    console.log('📋 Total secciones encontradas:', allSections.length);
    
    allSections.forEach((section, index) => {
        const title = section.querySelector('h2');
        if (!title) {
            console.log('⚠️ Sección', index, 'sin título');
            return;
        }
        
        const sectionName = title.textContent.trim();
        console.log('📌 Procesando sección:', sectionName);
        
        // Administrador y Super Usuario: ven todo EXCEPTO Reportes y Configuración
        if (rol === 'administrador' || rol === 'super_usuario') {
            if (sectionName === 'Reportes y Estadísticas' || sectionName === 'Configuración del Sistema') {
                section.style.display = 'none';
                console.log('  ❌ Admin - Ocultando:', sectionName);
            } else {
                section.style.display = 'block';
                console.log('  ✅ Admin - Mostrando:', sectionName);
            }
            return;
        }
        
        // Dueño: ve Gestión Usuario y Gestión Producto (sin Reportes ni Configuración)
        if (rol === 'dueño') {
            if (sectionName === 'Gestión de Usuarios' || sectionName === 'Gestión de Productos') {
                section.style.display = 'block';
                console.log('  ✅ Dueño - Mostrando:', sectionName);
            } else {
                section.style.display = 'none';
                console.log('  ❌ Dueño - Ocultando:', sectionName);
            }
            return;
        }
        
        // Vendedor: solo ve Gestión de Productos
        if (rol === 'vendedor') {
            if (sectionName === 'Gestión de Productos') {
                section.style.display = 'block';
                console.log('  ✅ Vendedor - Mostrando:', sectionName);
            } else {
                section.style.display = 'none';
                console.log('  ❌ Vendedor - Ocultando:', sectionName);
            }
            return;
        }
        
        // Por defecto, ocultar todo
        section.style.display = 'none';
    });
    
    console.log('✅ Permisos configurados');
}

// Funciones para gestión de productos
async function mostrarGestionProductos() {
    console.log('🔄 Mostrando gestión de productos...');
    
    // Crear modal con lista de productos
    const modal = document.createElement('div');
    modal.className = 'modal-productos';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 1200px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: #1976d2;">Gestión de Productos</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="actualizarListaProductos()" style="padding: 0.5rem 1rem; background: #4caf50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-sync-alt"></i> Actualizar
                    </button>
                    <button onclick="cerrarModalProductos()" style="padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">Cerrar</button>
                </div>
            </div>
            
            <!-- Buscador -->
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 10px;">
                <h4 style="margin: 0 0 1rem 0; color: #333;">Buscar Productos:</h4>
                <div style="display: flex; gap: 0.5rem; align-items: center;">
                    <input type="text" id="buscador-productos" placeholder="Buscar por nombre, descripción o categoría..." 
                           style="flex: 1; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; outline: none; transition: border-color 0.3s ease;"
                           onkeyup="filtrarProductosPorBusqueda(this.value)">
                    <button onclick="limpiarBusqueda()" style="padding: 0.8rem 1rem; background: #666; color: white; border: none; border-radius: 8px; cursor: pointer;">
                        <i class="fas fa-times"></i> Limpiar
                    </button>
                </div>
            </div>
            
            <!-- Filtros por categoría -->
            <div style="margin-bottom: 1.5rem; padding: 1rem; background: #f8f9fa; border-radius: 10px;">
                <h4 style="margin: 0 0 1rem 0; color: #333;">Filtrar por Categoría:</h4>
                <div id="filtros-dinamicos" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="filtro-categoria" data-categoria="todos" style="padding: 0.5rem 1rem; background: #1976d2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Todos</button>
                </div>
                <div style="margin-top: 1rem; padding: 0.5rem; background: #fff; border-radius: 5px; border: 1px solid #e0e0e0;">
                    <small style="color: #666;">Total de productos: <strong id="contador-productos">0</strong></small>
                </div>
            </div>
            
            <div id="lista-productos">
                <p>Cargando productos...</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Agregar event listeners a los filtros
    const filtros = modal.querySelectorAll('.filtro-categoria');
    filtros.forEach(filtro => {
        filtro.addEventListener('click', function() {
            // Remover clase activa de todos
            filtros.forEach(f => {
                f.style.background = '#e0e0e0';
                f.style.color = '#333';
            });
            // Agregar clase activa al seleccionado
            this.style.background = '#1976d2';
            this.style.color = 'white';
            
            const categoria = this.dataset.categoria;
            filtrarProductosPorCategoria(modal, categoria);
        });
    });
    
    // Cargar productos desde Firebase o localStorage
    await cargarProductosEnModal(modal);
}

async function cargarProductosEnModal(modal) {
    try {
        let productos = [];
        
        // PRIORIDAD 1: Intentar cargar desde Firebase
        if (window.firebaseService && window.firebaseService.initialized) {
            console.log('🔥 Cargando productos desde Firebase...');
            try {
                const result = await window.firebaseService.getAllProducts();
                if (result.success && result.data && result.data.length > 0) {
                    productos = result.data;
                    console.log(`🔥 ${productos.length} productos cargados desde Firebase`);
                    
                    // Actualizar localStorage como backup
                    localStorage.setItem('pincelart_productos', JSON.stringify(productos));
                    console.log('✅ localStorage actualizado con productos de Firebase');
                } else {
                    console.log('⚠️ Firebase vacío, cargando desde localStorage...');
                    productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
                    console.log(`📦 ${productos.length} productos obtenidos de localStorage`);
                }
            } catch (error) {
                console.error('❌ Error cargando desde Firebase:', error);
                console.log('💾 Fallback: Cargando desde localStorage...');
                productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
                console.log(`📦 ${productos.length} productos obtenidos de localStorage`);
            }
        } else {
            productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
            console.log(`📦 ${productos.length} productos obtenidos de localStorage (Firebase no disponible)`);
        }
        
        // LIMPIAR DUPLICADOS
        const productosUnicos = [];
        const idsVistos = new Set();
        
        productos.forEach(p => {
            if (p.id && !idsVistos.has(p.id)) {
                idsVistos.add(p.id);
                productosUnicos.push(p);
            }
        });
        
        if (productosUnicos.length !== productos.length) {
            console.log(`🗑️ Eliminando ${productos.length - productosUnicos.length} duplicados (de ${productos.length} a ${productosUnicos.length})`);
            productos = productosUnicos;
            localStorage.setItem('pincelart_productos', JSON.stringify(productos));
        }
        
        // SI localStorage está vacío o tiene más de 200 productos, limpiar y cargar desde carpetas
        if (productos.length === 0 || productos.length > 200) {
            console.log('🔄 Limpiando localStorage y cargando 166 productos desde carpetas locales...');
            
            if (typeof window.obtenerProductosLocales === 'function') {
                const productosLocales = window.obtenerProductosLocales();
                console.log(`📦 ${productosLocales.length} productos en carpetas locales`);
                
                // Crear mapa de productos únicos por ID
                const mapUnicos = new Map();
                productosLocales.forEach(p => {
                    if (!mapUnicos.has(p.id)) {
                        mapUnicos.set(p.id, p);
                    }
                });
                
                productos = Array.from(mapUnicos.values());
                console.log(`✨ ${productos.length} productos únicos desde carpetas`);
                
                // Guardar SOLO estos 166 productos en localStorage
                localStorage.setItem('pincelart_productos', JSON.stringify(productos));
                console.log('✅ 166 productos guardados en localStorage');
            } else {
                console.log('⚠️ No se puede cargar desde carpetas locales');
            }
        } else {
            // Ya hay productos en localStorage, usarlos
            console.log(`✅ Usando ${productos.length} productos de localStorage`);
        }
        
        // Guardar todos los productos para filtrar
        productosTodos = productos;
        productosFiltradosActuales = [...productos];
        
        // DIAGNÓSTICO: Ver TODOS los productos y sus categorías
        console.log('🔍 DIAGNÓSTICO COMPLETO DE PRODUCTOS:');
        console.log(`📦 Total productos en localStorage: ${productos.length}`);
        
        productos.forEach((p, idx) => {
            console.log(`   Producto ${idx + 1}: ${p.nombre} - Categoría: "${p.categoria}" - Estado: ${p.estado}`);
        });
        
        // CREAR FILTROS DINÁMICAMENTE
        const filtrosContainer = modal.querySelector('#filtros-dinamicos');
        if (filtrosContainer) {
            // Obtener categorías únicas
            const categorias = [...new Set(productos.map(p => p.categoria).filter(c => c))];
            
            console.log('📊 CATEGORÍAS ENCONTRADAS:', categorias);
            console.log('🔢 CANTIDAD DE PRODUCTOS POR CATEGORÍA:');
            categorias.forEach(cat => {
                const count = productos.filter(p => p.categoria === cat).length;
                console.log(`   - ${cat}: ${count} productos`);
            });
            
            // Limpiar filtros antiguos (excepto "Todos")
            const todosBtn = filtrosContainer.querySelector('[data-categoria="todos"]');
            filtrosContainer.innerHTML = '';
            filtrosContainer.appendChild(todosBtn);
            
            // Crear filtros para cada categoría
            categorias.forEach(categoria => {
                const cantidad = productos.filter(p => p.categoria === categoria).length;
                console.log(`🔘 Creando filtro para: ${categoria} (${cantidad} productos)`);
                
                const btn = document.createElement('button');
                btn.className = 'filtro-categoria';
                btn.dataset.categoria = categoria.toLowerCase();
                btn.textContent = `${categoria} (${cantidad})`;
                btn.style.cssText = 'padding: 0.5rem 1rem; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;';
                
                // AGREGAR EVENT LISTENER AL BOTÓN CON ILUMINACIÓN
                btn.addEventListener('click', function() {
                    // ILUMINAR botón seleccionado
                    const todosLosFiltros = modal.querySelectorAll('.filtro-categoria');
                    todosLosFiltros.forEach(f => {
                        f.style.background = '#e0e0e0';
                        f.style.color = '#333';
                        f.style.fontWeight = 'normal';
                    });
                    this.style.background = '#1976d2';
                    this.style.color = 'white';
                    this.style.fontWeight = '600';
                    
                    filtrarProductosPorCategoria(modal, categoria.toLowerCase());
                });
                
                filtrosContainer.appendChild(btn);
            });
            
            console.log('✅ Filtros dinámicos creados:', categorias);
        }
        
        renderizarListaProductos(modal, productos);
        
        // Configurar el buscador para que funcione
        const buscador = modal.querySelector('#buscador-productos');
        if (buscador) {
            buscador.addEventListener('input', function() {
                filtrarProductosPorBusqueda(this.value);
            });
        }
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        const listaProductos = modal.querySelector('#lista-productos');
        listaProductos.innerHTML = '<p style="color: red;">Error cargando productos. Por favor, recarga la página.</p>';
    }
}

function actualizarListaProductos() {
    console.log('🔄 Actualizando lista de productos...');
    // Buscar el modal activo
    const modal = document.querySelector('div[style*="position: fixed"][style*="z-index: 10000"]');
    if (modal) {
        cargarProductosEnModal(modal);
    }
}

function renderizarListaProductos(modal, productos) {
    const listaProductos = modal.querySelector('#lista-productos');
    
    // LIMPIAR lista primero para evitar duplicados
    listaProductos.innerHTML = '';
    
    if (productos.length === 0) {
        listaProductos.innerHTML = '<p>No hay productos disponibles. Haz clic en "Agregar Producto" para crear uno nuevo.</p>';
        const contador = modal.querySelector('#contador-productos');
        if (contador) contador.textContent = '0';
        return;
    }
    
    // Organizar por categorías DINÁMICAMENTE (cualquier categoría)
    const productosPorCategoria = {};
    
    productos.forEach(producto => {
        if (producto.categoria) {
            const categoria = producto.categoria.toLowerCase();
            if (!productosPorCategoria[categoria]) {
                productosPorCategoria[categoria] = [];
            }
            productosPorCategoria[categoria].push(producto);
        }
    });
    
    console.log('📊 Categorías a renderizar:', Object.keys(productosPorCategoria));
    
    let html = '';
    
    // Recorrer TODAS las categorías encontradas
    Object.keys(productosPorCategoria).forEach(categoria => {
        if (productosPorCategoria[categoria].length > 0) {
            const colorCategoria = categoria === 'ropa' ? '#4caf50' : categoria === 'accesorios' ? '#ff9800' : categoria === 'hogar' ? '#9c27b0' : '#1976d2';
            const iconoCategoria = categoria === 'ropa' ? '👕' : categoria === 'accesorios' ? '👜' : categoria === 'hogar' ? '🏠' : '📦';
            
            html += `
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin: 0 0 1rem 0; color: ${colorCategoria}; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.5rem;">${iconoCategoria}</span>
                        <span>${categoria.charAt(0).toUpperCase() + categoria.slice(1)} (${productosPorCategoria[categoria].length})</span>
                    </h3>
                    <div style="display: grid; gap: 1rem;">
            `;
            
            productosPorCategoria[categoria].forEach(producto => {
                // Generar ID único para la imagen: primera letra + timestamp del ID
                const primeraLetra = producto.nombre ? producto.nombre.charAt(0).toLowerCase() : 'p';
                const idUnico = `${primeraLetra}${producto.id ? producto.id.slice(-8) : Date.now()}`;
                const imagenId = `img-producto-${idUnico}`;
                
                html += `
                    <div style="border: 1px solid #e0e0e0; border-radius: 10px; padding: 1rem; display: flex; align-items: center; gap: 1rem; transition: all 0.3s ease;">
                        <img id="${imagenId}" 
                             src="${producto.imagen}" 
                             alt="${producto.nombre}" 
                             data-producto-id="${producto.id}"
                             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" 
                             onerror="console.error('❌ Error cargando imagen para ${producto.nombre}:', this.src); this.src='images/Logo/logo-pincelart.jpg'"
                             loading="lazy">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 0.5rem 0; color: #333;">${producto.nombre}</h4>
                            <p style="margin: 0; color: #666; font-size: 0.9rem;">${producto.descripcion || 'Sin descripción'}</p>
                            <div style="margin-top: 0.5rem; display: flex; gap: 1rem; font-size: 0.8rem; flex-wrap: wrap;">
                                <span style="background: ${colorCategoria}; color: white; padding: 0.2rem 0.5rem; border-radius: 12px;">${categoria}</span>
                                <span style="color: #1976d2; font-weight: 600;">$${producto.precio.toLocaleString()}</span>
                                <span style="color: #666;">Stock: ${producto.stock}</span>
                                <span style="color: ${producto.estado === 'activo' || producto.estado === 'disponible' ? '#4caf50' : '#f44336'}; font-weight: 600;">
                                    ${producto.estado === 'activo' || producto.estado === 'disponible' ? '✓ Activo' : '✗ Inactivo'}
                                </span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="editarProducto('${producto.id}')" style="padding: 0.3rem 0.8rem; background: #ff9800; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem; transition: all 0.3s ease; font-weight: 600;">Editar</button>
                            <button onclick="eliminarProducto('${producto.id}')" style="padding: 0.3rem 0.8rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem; transition: all 0.3s ease; font-weight: 600;">Eliminar</button>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
    });
    
    listaProductos.innerHTML = html;
    
    // Actualizar contador
    const contador = modal.querySelector('#contador-productos');
    if (contador) contador.textContent = productos.length;
}

// Almacenar productos originales para filtrar
let productosTodos = [];
let productosFiltradosActuales = [];

// Función para generar HTML de la lista de productos (para actualización)
function renderizarListaProductosHTML(productos, modal) {
    if (productos.length === 0) {
        return '<p style="text-align: center; color: #666; padding: 2rem;">No hay productos disponibles.</p>';
    }
    
    // Organizar por categorías
    const productosPorCategoria = {
        ropa: [],
        accesorios: [],
        hogar: []
    };
    
    productos.forEach(producto => {
        if (producto.categoria && productosPorCategoria[producto.categoria]) {
            productosPorCategoria[producto.categoria].push(producto);
        }
    });
    
    let html = '';
    
    // Recorrer cada categoría
    ['ropa', 'accesorios', 'hogar'].forEach(categoria => {
        if (productosPorCategoria[categoria].length > 0) {
            const colorCategoria = categoria === 'ropa' ? '#4caf50' : categoria === 'accesorios' ? '#ff9800' : '#9c27b0';
            const iconoCategoria = categoria === 'ropa' ? '👕' : categoria === 'accesorios' ? '👜' : '🏠';
            
            html += `
                <div style="margin-bottom: 2rem;">
                    <h3 style="margin: 0 0 1rem 0; color: ${colorCategoria}; display: flex; align-items: center; gap: 0.5rem;">
                        <span style="font-size: 1.5rem;">${iconoCategoria}</span>
                        <span>${categoria.charAt(0).toUpperCase() + categoria.slice(1)} (${productosPorCategoria[categoria].length})</span>
                    </h3>
                    <div style="display: grid; gap: 1rem;">
            `;
            
            productosPorCategoria[categoria].forEach(producto => {
                // Generar ID único para la imagen
                const primeraLetra = producto.nombre ? producto.nombre.charAt(0).toLowerCase() : 'p';
                const idUnico = `${primeraLetra}${producto.id ? producto.id.slice(-8) : Date.now()}`;
                const imagenId = `img-producto-${idUnico}`;
                
                html += `
                    <div style="border: 1px solid #e0e0e0; border-radius: 10px; padding: 1rem; display: flex; align-items: center; gap: 1rem; transition: all 0.3s ease;">
                        <img id="${imagenId}" 
                             src="${producto.imagen}" 
                             alt="${producto.nombre}" 
                             data-producto-id="${producto.id}"
                             style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;" 
                             onerror="console.error('❌ Error cargando imagen:', this.src); this.src='images/Logo/logo-pincelart.jpg'"
                             loading="lazy">
                        <div style="flex: 1;">
                            <h4 style="margin: 0 0 0.5rem 0; color: #333;">${producto.nombre}</h4>
                            <p style="margin: 0; color: #666; font-size: 0.9rem;">${producto.descripcion || 'Sin descripción'}</p>
                            <div style="margin-top: 0.5rem; display: flex; gap: 1rem; font-size: 0.8rem; flex-wrap: wrap;">
                                <span style="background: ${colorCategoria}; color: white; padding: 0.2rem 0.5rem; border-radius: 12px;">${categoria}</span>
                                <span style="color: #1976d2; font-weight: 600;">$${producto.precio.toLocaleString()}</span>
                                <span style="color: #666;">Stock: ${producto.stock}</span>
                                <span style="color: ${producto.estado === 'activo' || producto.estado === 'disponible' ? '#4caf50' : '#f44336'}; font-weight: 600;">
                                    ${producto.estado === 'activo' || producto.estado === 'disponible' ? '✓ Activo' : '✗ Inactivo'}
                                </span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 0.5rem;">
                            <button onclick="editarProducto('${producto.id}')" style="padding: 0.3rem 0.8rem; background: #ff9800; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem; transition: all 0.3s ease; font-weight: 600;">Editar</button>
                            <button onclick="eliminarProducto('${producto.id}')" style="padding: 0.3rem 0.8rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem; transition: all 0.3s ease; font-weight: 600;">Eliminar</button>
                        </div>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
    });
    
    return html;
}

// Función para cerrar modal de productos correctamente
function cerrarModalProductos() {
    const modal = document.querySelector('.modal-productos');
    if (modal) {
        modal.remove();
    }
    // Limpiar variables globales
    productosTodos = [];
    productosFiltradosActuales = [];
}

function cerrarModalCrearUsuario() {
    // Cerrar solo el modal de crear usuario
    const modal = document.querySelector('.modal-crear-usuario');
    if (modal) {
        modal.remove();
        console.log('✅ Modal de crear usuario cerrado');
    }
}

function cerrarModalEditarUsuario() {
    // Cerrar solo el modal de editar usuario
    const modal = document.querySelector('.modal-editar-usuario');
    if (modal) {
        modal.remove();
        console.log('✅ Modal de editar usuario cerrado');
    }
}

function limpiarFormularioCrearUsuario() {
    // Limpiar todos los campos del formulario de crear usuario
    const form = document.querySelector('#form-crear-usuario');
    if (form) {
        form.reset();
        console.log('✅ Formulario de crear usuario limpiado');
    }
}

function limpiarFormularioEditarUsuario() {
    // Limpiar todos los campos del formulario de editar usuario
    const form = document.querySelector('#form-editar-usuario');
    if (form) {
        form.reset();
        console.log('✅ Formulario de editar usuario limpiado');
    }
}

// Funciones para modal de editar producto
function cerrarModalEditarProducto() {
    // Cerrar solo el modal de editar producto
    const modal = document.querySelector('.modal-editar-producto');
    if (modal) {
        modal.remove();
        console.log('✅ Modal de editar producto cerrado');
    }
}

function limpiarFormularioEditarProducto() {
    // Limpiar todos los campos del formulario de editar producto
    const form = document.querySelector('#form-editar-producto');
    if (form) {
        form.reset();
        console.log('✅ Formulario de editar producto limpiado');
    }
}

// Función para procesar nueva imagen
async function procesarImagenNueva(imagenFile, productoId) {
    try {
        console.log('📸 Convirtiendo imagen a Base64 (sin Firebase Storage)...');
        
        // USAR SOLO BASE64 - Sin intentar Firebase Storage para evitar CORS
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                console.log('✅ Imagen convertida a Base64 exitosamente');
                resolve(e.target.result);
            };
            reader.onerror = (error) => {
                console.error('❌ Error leyendo archivo:', error);
                reject(error);
            };
            reader.readAsDataURL(imagenFile);
        });
    } catch (error) {
        console.error('❌ Error procesando imagen:', error);
        throw error;
    }
}

// Función para actualizar filtros de categorías dinámicamente
function actualizarFiltrosCategoriasEnModal(modal, productos) {
    // Obtener todas las categorías únicas que EXISTEN en los productos actuales
    const categorias = [...new Set(productos.map(p => p.categoria).filter(c => c))];
    
    console.log('📊 Categorías actualizadas:', categorias);
    
    // Buscar el contenedor de filtros
    const filtrosContainer = modal.querySelector('.filtros-categorias');
    if (!filtrosContainer) return;
    
    // Guardar botón "Todos" existente
    const filtroTodos = filtrosContainer.querySelector('.filtro-categoria[data-categoria="todos"]');
    const todosHTML = filtroTodos ? filtroTodos.outerHTML : '';
    
    // Crear nuevos filtros dinámicamente SOLO con categorías que existen
    let filtrosHTML = filtroTodos ? `<div class="filtros-categorias" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">${todosHTML}` : 
                      '<div class="filtros-categorias" style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;">';
    
    // Agregar filtros SOLO para categorías que tienen productos
    categorias.forEach(categoria => {
        const cantidad = productos.filter(p => p.categoria === categoria).length;
        if (cantidad > 0) {
            filtrosHTML += `
                <button class="filtro-categoria" data-categoria="${categoria.toLowerCase()}" style="padding: 0.5rem 1rem; border: none; border-radius: 8px; background: #e0e0e0; color: #333; cursor: pointer; font-weight: 500; transition: all 0.3s;">
                    ${categoria} (${cantidad})
                </button>
            `;
        }
    });
    
    filtrosHTML += '</div>';
    
    // Reemplazar contenedor de filtros
    filtrosContainer.outerHTML = filtrosHTML;
    
    // Reconfigurar eventos de los filtros CON ILUMINACIÓN
    const nuevosFiltros = document.querySelectorAll('.filtro-categoria');
    nuevosFiltros.forEach(filtro => {
        filtro.addEventListener('click', function() {
            // ILUMINAR botón seleccionado
            nuevosFiltros.forEach(f => {
                f.style.background = '#e0e0e0';
                f.style.color = '#333';
                f.style.fontWeight = 'normal';
            });
            this.style.background = '#1976d2';
            this.style.color = 'white';
            this.style.fontWeight = '600';
            
            const categoria = this.dataset.categoria;
            filtrarProductosPorCategoria(modal, categoria);
        });
    });
    
    console.log('✅ Filtros de categorías actualizados:', categorias);
}

// Función para cerrar todos los modales y limpiar overlays
function cerrarTodosLosModales() {
    // Cerrar todos los modales
    const modales = document.querySelectorAll('.modal-productos, .modal-usuarios, .modal-crear-usuario, .modal-editar-usuario');
    modales.forEach(modal => modal.remove());
    
    // Limpiar variables globales
    productosTodos = [];
    productosFiltradosActuales = [];
    
    // Asegurar que no queden overlays grises
    const overlays = document.querySelectorAll('[style*="background: rgba(0,0,0,0.5)"]');
    overlays.forEach(overlay => overlay.remove());
    
    console.log('✅ Todos los modales cerrados correctamente');
}

// Función para mostrar diálogo de confirmación personalizado
function mostrarConfirmacionCentrada(mensaje, titulo = 'Confirmar acción') {
    return new Promise((resolve) => {
        const modal = document.createElement('div');
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            z-index: 10001;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        modal.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 400px; width: 90%; box-shadow: 0 10px 30px rgba(0,0,0,0.3); text-align: center;">
                <div style="margin-bottom: 1.5rem;">
                    <i class="fas fa-question-circle" style="font-size: 3rem; color: #1976d2; margin-bottom: 1rem;"></i>
                    <h3 style="margin: 0 0 0.5rem 0; color: #333; font-size: 1.3rem;">${titulo}</h3>
                    <p style="margin: 0; color: #666; font-size: 1rem; line-height: 1.5;">${mensaje}</p>
                </div>
                <div style="display: flex; gap: 0.5rem; justify-content: center;">
                    <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove(); window.__confirmacionResultado__(true);" 
                            style="padding: 0.8rem 2rem; background: #1976d2; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; min-width: 100px;">
                        Confirmar
                    </button>
                    <button onclick="this.parentElement.parentElement.parentElement.parentElement.remove(); window.__confirmacionResultado__(false);" 
                            style="padding: 0.8rem 2rem; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; min-width: 100px;">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Crear función temporal para capturar el resultado
        window.__confirmacionResultado__ = (resultado) => {
            resolve(resultado);
            delete window.__confirmacionResultado__;
        };
    });
}

// Función para verificar y corregir el rol del usuario
function verificarYCorregirRol() {
    const currentUser = JSON.parse(localStorage.getItem('pincelart_current_user'));
    
    if (!currentUser) {
        console.log('❌ No hay usuario autenticado');
        return;
    }
    
    console.log('👤 Usuario actual:', currentUser);
    console.log('🔍 Rol actual:', currentUser.rol);
    console.log('🔍 Tipo de rol:', typeof currentUser.rol);
    
    // Si el rol no es 'administrador', corregirlo
    if (currentUser.rol !== 'administrador') {
        console.log('🔧 Corrigiendo rol a "administrador"...');
        currentUser.rol = 'administrador';
        localStorage.setItem('pincelart_current_user', JSON.stringify(currentUser));
        console.log('✅ Rol corregido a "administrador"');
        
        // Mostrar mensaje de confirmación
        mostrarMensaje('Rol Corregido', 'Tu rol ha sido corregido a "administrador". Ahora puedes crear usuarios.', 'success');
    } else {
        console.log('✅ El rol ya es correcto: "administrador"');
        mostrarMensaje('Rol Correcto', 'Tu rol es "administrador". Puedes crear usuarios.', 'success');
    }
}

// Función para filtrar productos por búsqueda
function filtrarProductosPorBusqueda(termino) {
    const modal = document.querySelector('.modal-productos');
    if (!modal) return;
    
    if (!termino || termino.trim() === '') {
        // Si no hay término de búsqueda, mostrar todos los productos
        productosFiltradosActuales = [...productosTodos];
    } else {
        const terminoLower = termino.toLowerCase();
        productosFiltradosActuales = productosTodos.filter(producto => {
            return producto.nombre.toLowerCase().includes(terminoLower) ||
                   producto.descripcion.toLowerCase().includes(terminoLower) ||
                   producto.categoria.toLowerCase().includes(terminoLower);
        });
    }
    
    renderizarListaProductos(modal, productosFiltradosActuales);
    
    // Actualizar contador
    const contador = modal.querySelector('#contador-productos');
    if (contador) {
        if (termino && termino.trim() !== '') {
            contador.textContent = `${productosFiltradosActuales.length} de ${productosTodos.length}`;
        } else {
            contador.textContent = productosTodos.length;
        }
    }
}

// Función para limpiar búsqueda
function limpiarBusqueda() {
    const buscador = document.getElementById('buscador-productos');
    if (buscador) {
        buscador.value = '';
        filtrarProductosPorBusqueda('');
    }
}

function filtrarProductosPorCategoria(modal, categoria) {
    let productosFiltrados = productosTodos;
    
    console.log('🔍 Filtrando por categoría:', categoria);
    console.log('📊 Productos totales:', productosTodos.length);
    console.log('📊 Categorías disponibles:', [...new Set(productosTodos.map(p => p.categoria))]);
    
    if (categoria !== 'todos') {
        productosFiltrados = productosTodos.filter(p => {
            const categoriaProducto = p.categoria ? p.categoria.toLowerCase() : '';
            const categoriaFiltro = categoria.toLowerCase();
            const match = categoriaProducto === categoriaFiltro;
            if (match) {
                console.log('✅ Match:', p.nombre, '- Categoría:', p.categoria);
            }
            return match;
        });
        console.log(`✅ ${productosFiltrados.length} productos encontrados en categoría "${categoria}"`);
    } else {
        productosFiltrados = productosTodos;
        console.log('✅ Mostrando todos los productos');
    }
    
    // Actualizar productos filtrados actuales
    productosFiltradosActuales = [...productosFiltrados];
    
    renderizarListaProductos(modal, productosFiltrados);
    
    // Actualizar contador
    const contador = modal.querySelector('#contador-productos');
    if (contador) {
        if (categoria === 'todos') {
            contador.textContent = productosTodos.length;
        } else {
            contador.textContent = `${productosFiltrados.length} de ${productosTodos.length}`;
        }
    }
    
    // Limpiar búsqueda cuando se cambia categoría
    const buscador = modal.querySelector('#buscador-productos');
    if (buscador) {
        buscador.value = '';
    }
}

function mostrarCrearProducto() {
    console.log('🔄 Mostrando crear producto...');
    
    // Verificar permisos del usuario actual
    const currentUser = JSON.parse(localStorage.getItem('pincelart_current_user'));
    const rolValido = currentUser && (
        currentUser.rol === 'administrador' ||
        currentUser.rol === 'Administrador' ||
        currentUser.rol === 'ADMINISTRADOR' ||
        currentUser.rol === 'super_usuario' ||
        currentUser.rol === 'dueño' ||
        currentUser.rol === 'Dueño' ||
        currentUser.rol === 'vendedor' ||
        currentUser.rol === 'Vendedor' ||
        currentUser.id === 'super_user_001' ||
        currentUser.id === 'admin_001'
    );
    
    if (!rolValido) {
        mostrarMensaje('Error', 'No tienes permisos para agregar productos.', 'error');
        return;
    }
    
    // Crear modal para agregar producto
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: #4caf50;">Crear Nuevo Producto</h3>
                <button onclick="cerrarModalGestionUsuarios()" style="padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">Cerrar</button>
            </div>
            <form id="form-crear-producto" style="display: grid; gap: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Nombre del Producto</label>
                    <input type="text" name="nombre" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Descripción</label>
                    <textarea name="descripcion" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; min-height: 80px;"></textarea>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Categoría</label>
                    <select name="categoria" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        <option value="">Seleccione una categoría</option>
                        <option value="ropa">Ropa</option>
                        <option value="accesorios">Accesorios</option>
                        <option value="hogar">Hogar</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Precio</label>
                    <input type="number" name="precio" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Stock</label>
                    <input type="number" name="stock" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Imagen del Producto</label>
                    <input type="file" name="imagen" accept="image/*" id="imagen-producto" style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    <div id="preview-imagen" style="margin-top: 0.5rem; display: none;">
                        <img id="imagen-preview" src="" alt="Preview" style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 2px solid #e0e0e0;">
                    </div>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Estado</label>
                    <select name="estado" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button type="submit" style="flex: 1; padding: 0.8rem; background: #4caf50; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Crear Producto</button>
                    <button type="button" onclick="cerrarModalGestionUsuarios()" style="flex: 1; padding: 0.8rem; background: #f44336; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Preview de imagen
    const inputImagen = modal.querySelector('#imagen-producto');
    const previewImagen = modal.querySelector('#preview-imagen');
    const imgPreview = modal.querySelector('#imagen-preview');
    
    inputImagen.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                imgPreview.src = e.target.result;
                previewImagen.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Agregar event listener al formulario
    const form = modal.querySelector('#form-crear-producto');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        await crearProducto(form);
    });
}

async function crearProducto(form) {
    try {
        const formData = new FormData(form);
        
        const nuevoProducto = {
            nombre: formData.get('nombre').trim(),
            descripcion: formData.get('descripcion').trim(),
            categoria: formData.get('categoria'),
            precio: parseInt(formData.get('precio')),
            stock: parseInt(formData.get('stock')),
            estado: 'activo', // SIEMPRE activo para que se vea en el catálogo público
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
        };
        
        console.log('✅ Producto creado con estado: activo (siempre visible en catálogo)');
        
        // Validar campos
        if (!nuevoProducto.nombre || !nuevoProducto.descripcion || !nuevoProducto.precio || nuevoProducto.stock < 0) {
            mostrarMensaje('Error', 'Todos los campos son obligatorios y el stock debe ser mayor o igual a 0.', 'error');
            return;
        }
        
        // Procesar imagen si existe
        const imagenFile = formData.get('imagen');
        if (imagenFile && imagenFile.size > 0) {
            // Generar ID único para el producto
            const productoId = `producto-${Date.now()}`;
            
            // Subir imagen a Firebase Storage
            if (window.firebaseService && window.firebaseService.initialized) {
                try {
                    console.log('📸 Subiendo imagen a Firebase Storage...');
                    nuevoProducto.imagen = await window.firebaseService.uploadImage(imagenFile, productoId);
                    nuevoProducto.id = productoId;
                    console.log('✅ Imagen subida:', nuevoProducto.imagen.substring(0, 50) + '...');
                } catch (error) {
                    console.error('❌ Error subiendo imagen:', error);
                    // Fallback: convertir a base64
                    console.log('🔄 Convirtiendo a base64...');
                    nuevoProducto.imagen = await procesarImagenNueva(imagenFile, productoId);
                    nuevoProducto.id = productoId;
                }
            } else {
                // Fallback: guardar como base64
                console.log('🔄 Convirtiendo imagen a base64...');
                nuevoProducto.imagen = await procesarImagenNueva(imagenFile, productoId);
                nuevoProducto.id = productoId;
            }
        } else {
            nuevoProducto.id = `producto-${Date.now()}`;
            nuevoProducto.imagen = 'images/Logo/logo-pincelart.jpg';
            console.log('ℹ️ No se seleccionó imagen, usando imagen por defecto');
        }
        
        console.log('📦 Producto preparado con ID:', nuevoProducto.id);
        console.log('📦 Producto:', JSON.stringify(nuevoProducto, null, 2));
        
        // Guardar producto en Firebase
        if (window.firebaseService && window.firebaseService.initialized) {
            console.log('🔥 Guardando producto en Firebase...');
            const resultado = await window.firebaseService.addProduct(nuevoProducto);
            if (resultado && resultado.success) {
                console.log('✅ Producto guardado en Firebase exitosamente con ID:', resultado.id);
            } else {
                console.error('❌ Error guardando en Firebase:', resultado);
            }
        } else {
            console.warn('⚠️ Firebase no está inicializado');
        }
        
        // Guardar en localStorage también
        const productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        productos.push(nuevoProducto);
        localStorage.setItem('pincelart_productos', JSON.stringify(productos));
        
        mostrarMensaje('¡Éxito!', 'Producto creado exitosamente.', 'success');
        
        // Disparar evento para actualizar catálogo en tiempo real
        const productosActualizados = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        window.dispatchEvent(new CustomEvent('productos-actualizados', { 
            detail: { productos: productosActualizados } 
        }));
        console.log('✅ Evento productos-actualizados disparado');
        
        // Limpiar formulario
        form.reset();
        document.querySelector('#preview-imagen').style.display = 'none';
        
        // Cerrar modal después de un delay
        setTimeout(() => {
            cerrarModalGestionUsuarios();
        }, 1500);
        
    } catch (error) {
        console.error('❌ Error creando producto:', error);
        mostrarMensaje('Error', 'Ocurrió un error inesperado al crear el producto.', 'error');
    }
}

function mostrarGestionUsuarios() {
    console.log('🔄 Mostrando gestión de usuarios (versión nueva)');
    
    // Verificar permisos
    const currentUser = JSON.parse(localStorage.getItem('pincelart_current_user'));
    if (!currentUser) {
        mostrarMensaje('Error', 'No hay usuario autenticado.', 'error');
        return;
    }
    
    // Admin, super_usuario y dueño pueden gestionar usuarios
    const puedeGestionar = currentUser.rol === 'administrador' || 
                          currentUser.rol === 'super_usuario' ||
                          currentUser.rol === 'dueño' ||
                          currentUser.id === 'super_user_001';
    
    if (!puedeGestionar) {
        mostrarMensaje('Error', 'No tienes permisos para gestionar usuarios.', 'error');
        return;
    }
    
    // Crear modal SIN clase para evitar conflictos
    const modal = document.createElement('div');
    modal.id = 'modal-gestion-usuarios';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.5); z-index: 10000;
        display: flex; align-items: center; justify-content: center;
    `;
    
    // Obtener usuarios
    const usuarios = JSON.parse(localStorage.getItem('pincelart_users')) || [];
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 1000px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: #1976d2;">Gestión de Usuarios</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="actualizarListaUsuarios()" style="padding: 0.5rem 1rem; background: #4caf50; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">
                        <i class="fas fa-sync-alt"></i> Actualizar
                    </button>
                    <button onclick="cerrarModalGestionUsuarios()" style="padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">Cerrar</button>
                </div>
            </div>
            <div id="lista-usuarios">
                ${generarListaUsuariosNueva(usuarios, currentUser)}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function generarListaUsuarios(usuarios, currentUser) {
    if (usuarios.length === 0) {
        return '<p>No hay usuarios registrados.</p>';
    }
    
    let html = '<div style="display: grid; gap: 1rem;">';
    usuarios.forEach(usuario => {
        let rolColor = '#2196f3'; // Azul por defecto
        let rolTexto = usuario.rol;
        
        if (usuario.rol === 'administrador' || usuario.rol === 'Administrador') {
            rolColor = '#ffd700'; // Oro
            rolTexto = 'Administrador';
        } else if (usuario.rol === 'dueño' || usuario.rol === 'Dueño') {
            rolColor = '#f44336'; // Rojo
            rolTexto = 'Dueño';
        } else if (usuario.rol === 'super_usuario' || usuario.rol === 'super administrador') {
            rolColor = '#ffd700'; // Oro
            rolTexto = 'Super Administrador';
        } else if (usuario.rol === 'vendedor' || usuario.rol === 'Vendedor') {
            rolColor = '#2196f3'; // Azul
            rolTexto = 'Vendedor';
        } else {
            rolTexto = usuario.rol; // Mostrar el rol tal como está
        }
        
        // Solo el administrador puede hacer CRUD de todos los usuarios
        const puedeEditar = currentUser && (
            currentUser.rol === 'administrador' ||
            currentUser.rol === 'super_usuario' ||
            currentUser.id === 'super_user_001' ||
            currentUser.id === 'admin_001'
        );
        const puedeEliminar = currentUser && (
            currentUser.rol === 'administrador' ||
            currentUser.rol === 'super_usuario' ||
            currentUser.id === 'super_user_001' ||
            currentUser.id === 'admin_001'
        );
        
        html += `
            <div style="border: 1px solid #e0e0e0; border-radius: 10px; padding: 1rem; display: flex; align-items: center; gap: 1rem;">
                <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #1976d2, #42a5f5); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600;">
                    ${usuario.name.charAt(0).toUpperCase()}
                </div>
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.5rem 0; color: #333;">${usuario.name}</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">${usuario.email}</p>
                    <div style="margin-top: 0.5rem; display: flex; gap: 1rem; font-size: 0.8rem;">
                        <span style="background: ${rolColor}; color: white; padding: 0.2rem 0.5rem; border-radius: 12px;">${rolTexto}</span>
                        <span style="color: #666;">Tel: ${usuario.phone}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    ${puedeEditar ? `<button onclick="editarUsuario('${usuario.id}')" style="padding: 0.3rem 0.8rem; background: #ff9800; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">Editar</button>` : '<span style="padding: 0.3rem 0.8rem; background: #ccc; color: #666; border-radius: 5px; font-size: 0.8rem;">Sin permisos</span>'}
                    ${puedeEliminar ? `<button onclick="eliminarUsuario('${usuario.id}')" style="padding: 0.3rem 0.8rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">Eliminar</button>` : '<span style="padding: 0.3rem 0.8rem; background: #ccc; color: #666; border-radius: 5px; font-size: 0.8rem;">Sin permisos</span>'}
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    return html;
}

function mostrarCrearUsuario() {
    console.log('🔄 Mostrando crear usuario...');
    
    // Verificar permisos del usuario actual
    const currentUser = JSON.parse(localStorage.getItem('pincelart_current_user'));
    console.log('👤 Usuario actual:', currentUser);
    
    if (!currentUser) {
        mostrarMensaje('Error', 'No hay usuario autenticado.', 'error');
        return;
    }
    
    // Debug: Mostrar el rol actual
    console.log('🔍 Rol actual:', currentUser.rol);
    console.log('🔍 Tipo de rol:', typeof currentUser.rol);
    
    // Verificar permisos de administrador (incluye super_usuario, administrador, etc.)
    const rolValido = currentUser.rol === 'administrador' || 
                     currentUser.rol === 'Administrador' || 
                     currentUser.rol === 'ADMINISTRADOR' ||
                     currentUser.rol === 'super_usuario' ||
                     currentUser.rol === 'super administrador' ||
                     currentUser.rol === 'dueño' ||
                     currentUser.id === 'super_user_001' ||
                     currentUser.id === 'admin_001';
    
    if (!rolValido) {
        mostrarMensaje('Error', `No tienes permisos para crear usuarios. Tu rol actual es: "${currentUser.rol}"`, 'error');
        return;
    }
    
    // Determinar si debemos ocultar la opción "administrador" del select
    const ocultarAdmin = currentUser.rol === 'dueño';
    
    // Crear modal con formulario
    const modal = document.createElement('div');
    modal.className = 'modal-crear-usuario';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: #1976d2;">Crear Nuevo Usuario</h3>
                <button onclick="cerrarModalCrearUsuario()" style="padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">Cerrar</button>
            </div>
            <form id="form-crear-usuario" style="display: grid; gap: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Nombre Completo</label>
                    <input type="text" name="nombre" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Email</label>
                    <input type="email" name="email" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Teléfono</label>
                    <input type="tel" name="telefono" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Contraseña</label>
                    <input type="password" name="password" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Rol</label>
                    <select name="rol" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        ${ocultarAdmin ? '' : '<option value="administrador">Administrador</option>'}
                        <option value="dueño">Dueño</option>
                        <option value="vendedor">Vendedor</option>
                    </select>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button type="submit" style="flex: 1; padding: 0.8rem; background: #4caf50; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Crear Usuario</button>
                    <button type="button" onclick="limpiarFormularioCrearUsuario()" style="flex: 1; padding: 0.8rem; background: #ff9800; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Limpiar</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Agregar event listener al formulario
    const form = modal.querySelector('#form-crear-usuario');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        crearUsuario(form);
    });
}

async function crearUsuario(form) {
    try {
        const formData = new FormData(form);
        
        const nuevoUsuario = {
            id: `user_${Date.now()}`,
            nombre: formData.get('nombre').trim(),
            name: formData.get('nombre').trim(), // Compatibilidad
            email: formData.get('email').trim(),
            telefono: formData.get('telefono').trim(),
            phone: formData.get('telefono').trim(), // Compatibilidad
            password: formData.get('password'),
            rol: formData.get('rol'),
            fechaCreacion: new Date().toISOString()
        };
        
        // Validar que todos los campos estén llenos
        if (!nuevoUsuario.nombre || !nuevoUsuario.email || !nuevoUsuario.telefono || !nuevoUsuario.password) {
            mostrarMensaje('Error', 'Todos los campos son obligatorios.', 'error');
            return;
        }
        
        // Obtener usuarios existentes
        const usuarios = JSON.parse(localStorage.getItem('pincelart_users')) || [];
        
        // Verificar si el email ya existe
        if (usuarios.some(u => u.email === nuevoUsuario.email)) {
            mostrarMensaje('Error', 'Ya existe un usuario con este email.', 'error');
            return;
        }
        
        // Verificar si el teléfono ya existe
        if (usuarios.some(u => u.phone === nuevoUsuario.telefono || u.telefono === nuevoUsuario.telefono)) {
            mostrarMensaje('Error', 'Ya existe un usuario con este número de teléfono.', 'error');
            return;
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(nuevoUsuario.email)) {
            mostrarMensaje('Error', 'El formato del email no es válido.', 'error');
            return;
        }
        
        // Validar formato de teléfono (solo números, mínimo 7 dígitos)
        const phoneRegex = /^\d{7,15}$/;
        if (!phoneRegex.test(nuevoUsuario.telefono)) {
            mostrarMensaje('Error', 'El teléfono debe contener solo números y tener entre 7 y 15 dígitos.', 'error');
            return;
        }
        
        // Agregar nuevo usuario
        usuarios.push(nuevoUsuario);
        localStorage.setItem('pincelart_users', JSON.stringify(usuarios));
        
        // Guardar en Firebase si está disponible
        if (window.firebaseService && window.firebaseService.initialized) {
            try {
                await window.firebaseService.saveUser(nuevoUsuario);
                console.log('✅ Usuario guardado en Firebase:', nuevoUsuario.email);
            } catch (error) {
                console.error('❌ Error guardando usuario en Firebase:', error);
            }
        }
        
        mostrarMensaje('¡Éxito!', 'Usuario creado exitosamente.', 'success');
        
        // Limpiar los campos del formulario
        form.reset();
        
        // NO cerrar el modal automáticamente - el usuario decide cuándo cerrar
        
    } catch (error) {
        console.error('❌ Error creando usuario:', error);
        mostrarMensaje('Error', 'Ocurrió un error inesperado al crear el usuario.', 'error');
    }
}

// Funciones para editar y eliminar usuarios
function editarUsuario(usuarioId) {
    const usuarios = JSON.parse(localStorage.getItem('pincelart_users')) || [];
    const usuario = usuarios.find(u => u.id === usuarioId);
    
    if (!usuario) {
        mostrarMensaje('Error', 'Usuario no encontrado.', 'error');
        return;
    }
    
    // Validar permisos: dueño no puede editar administrador
    const currentUser = JSON.parse(localStorage.getItem('pincelart_current_user'));
    if (currentUser && currentUser.rol === 'dueño' && (usuario.rol === 'administrador' || usuario.rol === 'super_usuario')) {
        mostrarMensaje('Error', 'No tienes permisos para editar usuarios con rol de administrador.', 'error');
        return;
    }
    
    // Crear modal de edición
    const modal = document.createElement('div');
    modal.className = 'modal-editar-usuario';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: #1976d2;">Editar Usuario</h3>
                <button onclick="cerrarModalEditarUsuario()" style="padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">Cerrar</button>
            </div>
            <form id="form-editar-usuario" style="display: grid; gap: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Nombre Completo</label>
                    <input type="text" name="nombre" value="${usuario.name}" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Email</label>
                    <input type="email" name="email" value="${usuario.email}" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Teléfono</label>
                    <input type="tel" name="telefono" value="${usuario.phone}" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Nueva Contraseña (dejar vacío para mantener la actual)</label>
                    <input type="password" name="password" style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Rol</label>
                    <select name="rol" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        <option value="dueño" ${usuario.rol === 'dueño' ? 'selected' : ''}>Dueño</option>
                        <option value="administrador" ${usuario.rol === 'administrador' ? 'selected' : ''}>Administrador</option>
                        <option value="vendedor" ${usuario.rol === 'vendedor' ? 'selected' : ''}>Vendedor</option>
                    </select>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button type="submit" style="flex: 1; padding: 0.8rem; background: #4caf50; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Guardar Cambios</button>
                    <button type="button" onclick="limpiarFormularioEditarUsuario()" style="flex: 1; padding: 0.8rem; background: #ff9800; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Limpiar</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Agregar event listener al formulario
    const form = modal.querySelector('#form-editar-usuario');
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        actualizarUsuario(usuarioId, form);
    });
}

function actualizarUsuario(usuarioId, form) {
    try {
        const formData = new FormData(form);
        
        const usuarios = JSON.parse(localStorage.getItem('pincelart_users')) || [];
        const usuarioIndex = usuarios.findIndex(u => u.id === usuarioId);
        
        if (usuarioIndex === -1) {
            mostrarMensaje('Error', 'Usuario no encontrado.', 'error');
            return;
        }
        
        const datosActualizados = {
            name: formData.get('nombre').trim(),
            email: formData.get('email').trim(),
            phone: formData.get('telefono').trim(),
            rol: formData.get('rol')
        };
        
        // Validar que todos los campos estén llenos
        if (!datosActualizados.name || !datosActualizados.email || !datosActualizados.phone) {
            mostrarMensaje('Error', 'Todos los campos son obligatorios.', 'error');
            return;
        }
        
        // Verificar si el email ya existe en otro usuario
        if (usuarios.some((u, index) => u.email === datosActualizados.email && index !== usuarioIndex)) {
            mostrarMensaje('Error', 'Ya existe otro usuario con este email.', 'error');
            return;
        }
        
        // Verificar si el teléfono ya existe en otro usuario
        if (usuarios.some((u, index) => u.phone === datosActualizados.phone && index !== usuarioIndex)) {
            mostrarMensaje('Error', 'Ya existe otro usuario con este número de teléfono.', 'error');
            return;
        }
        
        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(datosActualizados.email)) {
            mostrarMensaje('Error', 'El formato del email no es válido.', 'error');
            return;
        }
        
        // Validar formato de teléfono (solo números, mínimo 7 dígitos)
        const phoneRegex = /^\d{7,15}$/;
        if (!phoneRegex.test(datosActualizados.phone)) {
            mostrarMensaje('Error', 'El teléfono debe contener solo números y tener entre 7 y 15 dígitos.', 'error');
            return;
        }
        
        // Actualizar usuario
        usuarios[usuarioIndex] = {
            ...usuarios[usuarioIndex],
            ...datosActualizados,
            fechaActualizacion: new Date().toISOString()
        };
        
        // Actualizar contraseña solo si se proporcionó una nueva
        const nuevaPassword = formData.get('password');
        if (nuevaPassword && nuevaPassword.trim() !== '') {
            usuarios[usuarioIndex].password = nuevaPassword;
        }
        
        localStorage.setItem('pincelart_users', JSON.stringify(usuarios));
        
        // Actualizar en Firebase si está disponible
        if (window.firebaseService && window.firebaseService.initialized) {
            window.firebaseService.saveUser(usuarios[usuarioIndex]);
        }
        
        mostrarMensaje('¡Éxito!', 'Usuario actualizado exitosamente.', 'success');
        
        // Limpiar los campos del formulario
        form.reset();
        
        // Cerrar el modal de edición
        const modalEdicion = document.querySelector('.modal-editar-usuario');
        if (modalEdicion) {
            modalEdicion.remove();
        }
        
        // Actualizar la lista de usuarios
        const modalGestion = document.querySelector('.modal-usuarios');
        if (modalGestion) {
            const listaUsuarios = modalGestion.querySelector('#lista-usuarios');
            if (listaUsuarios) {
                const usuariosActualizados = JSON.parse(localStorage.getItem('pincelart_users')) || [];
                const currentUser = JSON.parse(localStorage.getItem('pincelart_current_user'));
                listaUsuarios.innerHTML = generarListaUsuarios(usuariosActualizados, currentUser);
            }
        }
        
    } catch (error) {
        console.error('❌ Error actualizando usuario:', error);
        mostrarMensaje('Error', 'Ocurrió un error inesperado al actualizar el usuario.', 'error');
    }
}

// ==========================================
// FUNCIONES NUEVAS DE GESTIÓN DE USUARIOS
// ==========================================

function generarListaUsuariosNueva(usuarios, currentUser) {
    if (usuarios.length === 0) {
        return '<p style="text-align: center; color: #666; padding: 2rem;">No hay usuarios registrados.</p>';
    }
    
    let html = '<div style="display: grid; gap: 1rem;">';
    
    usuarios.forEach(usuario => {
        // Determinar color y texto del rol
        let rolColor = '#2196f3';
        let rolTexto = 'Usuario';
        
        if (usuario.rol === 'administrador' || usuario.rol === 'super_usuario') {
            rolColor = '#ffd700';
            rolTexto = 'Administrador';
        } else if (usuario.rol === 'vendedor') {
            rolColor = '#2196f3';
            rolTexto = 'Vendedor';
        } else if (usuario.rol === 'dueño') {
            rolColor = '#f44336';
            rolTexto = 'Dueño';
        }
        
        // Verificar permisos para editar/eliminar
        const puedeGestionar = currentUser.rol === 'administrador' || 
                               currentUser.rol === 'super_usuario' ||
                               currentUser.rol === 'dueño' ||
                               currentUser.id === 'super_user_001';
        
        // Si es dueño, no puede editar/eliminar administradores
        const puedeEditarEliminar = puedeGestionar && !(currentUser.rol === 'dueño' && (usuario.rol === 'administrador' || usuario.rol === 'super_usuario'));
        
        html += `
            <div style="border: 1px solid #e0e0e0; border-radius: 10px; padding: 1rem; display: flex; align-items: center; gap: 1rem; transition: all 0.3s;">
                <div style="width: 50px; height: 50px; background: linear-gradient(135deg, #1976d2, #42a5f5); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 1.2rem; flex-shrink: 0;">
                    ${usuario.name ? usuario.name.charAt(0).toUpperCase() : '?'}
                </div>
                <div style="flex: 1; min-width: 0;">
                    <h4 style="margin: 0 0 0.5rem 0; color: #333; font-size: 1.1rem;">${usuario.name || 'Sin nombre'}</h4>
                    <p style="margin: 0 0 0.5rem 0; color: #666; font-size: 0.9rem; word-break: break-word;">${usuario.email || 'Sin email'}</p>
                    <div style="display: flex; gap: 1rem; font-size: 0.8rem; flex-wrap: wrap;">
                        <span style="background: ${rolColor}; color: white; padding: 0.2rem 0.6rem; border-radius: 12px; font-weight: 600;">${rolTexto}</span>
                        <span style="color: #666;">📞 ${usuario.phone || 'Sin teléfono'}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem; flex-shrink: 0;">
                    ${puedeEditarEliminar ? `
                        <button onclick="editarUsuario('${usuario.id}')" 
                                style="padding: 0.4rem 1rem; background: #ff9800; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.3s;"
                                onmouseover="this.style.background='#f57c00'; this.style.transform='scale(1.05)'"
                                onmouseout="this.style.background='#ff9800'; this.style.transform='scale(1)'">
                            Editar
                        </button>
                        <button onclick="eliminarUsuario('${usuario.id}')" 
                                style="padding: 0.4rem 1rem; background: #f44336; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 0.85rem; font-weight: 600; transition: all 0.3s;"
                                onmouseover="this.style.background='#d32f2f'; this.style.transform='scale(1.05)'"
                                onmouseout="this.style.background='#f44336'; this.style.transform='scale(1)'">
                            Eliminar
                        </button>
                    ` : `
                        <button disabled style="padding: 0.4rem 1rem; background: #ccc; color: #666; border: none; border-radius: 6px; cursor: not-allowed; font-size: 0.85rem;">Sin permisos</button>
                    `}
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    return html;
}

async function actualizarListaUsuarios() {
    const modal = document.getElementById('modal-gestion-usuarios');
    if (!modal) {
        console.log('⚠️ No se encontró el modal de usuarios');
        return;
    }
    
    const usuarios = JSON.parse(localStorage.getItem('pincelart_users')) || [];
    const currentUser = JSON.parse(localStorage.getItem('pincelart_current_user'));
    const listaDiv = modal.querySelector('#lista-usuarios');
    
    if (listaDiv) {
        listaDiv.innerHTML = generarListaUsuariosNueva(usuarios, currentUser);
        console.log('✅ Lista de usuarios actualizada');
    } else {
        console.log('⚠️ No se encontró #lista-usuarios');
    }
}

async function eliminarUsuario(usuarioId) {
    console.log('🗑️ ELIMINANDO USUARIO:', usuarioId);
    
    try {
        // 1. Obtener y validar usuario
        let usuarios = JSON.parse(localStorage.getItem('pincelart_users')) || [];
        const usuario = usuarios.find(u => u.id === usuarioId);
        
        if (!usuario) {
            mostrarMensaje('Error', 'Usuario no encontrado.', 'error');
            return;
        }
        
        console.log('👤 Usuario:', usuario.name);
        
        // 2. Validar permisos: dueño no puede eliminar administrador
        const currentUser = JSON.parse(localStorage.getItem('pincelart_current_user'));
        if (currentUser && currentUser.rol === 'dueño' && (usuario.rol === 'administrador' || usuario.rol === 'super_usuario')) {
            mostrarMensaje('Error', 'No tienes permisos para eliminar usuarios con rol de administrador.', 'error');
            return;
        }
        
        // 2. Confirmar con modal personalizado simple
        console.log('💬 Mostrando confirmación...');
        
        // Crear modal de confirmación
        const modalConfirm = document.createElement('div');
        modalConfirm.id = 'modal-confirm-eliminar';
        modalConfirm.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.6); z-index: 10002;
            display: flex; align-items: center; justify-content: center;
        `;
        
        let confirmResult = null;
        let confirmResolve = null;
        
        modalConfirm.innerHTML = `
            <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 400px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.4); text-align: center;">
                <div style="margin-bottom: 1.5rem;">
                    <div style="width: 60px; height: 60px; background: #f44336; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-trash-alt" style="font-size: 2rem; color: white;"></i>
                    </div>
                    <h3 style="margin: 0 0 0.5rem 0; color: #333; font-size: 1.4rem; font-weight: 700;">Confirmar Eliminación</h3>
                    <p style="margin: 0; color: #666; font-size: 1rem; line-height: 1.5;">
                        ¿Eliminar al usuario<br><strong style="color: #1976d2;">${usuario.name}</strong>?<br><br>
                        <small style="color: #999;">Esta acción no se puede deshacer.</small>
                    </p>
                </div>
                <div style="display: flex; gap: 1rem; justify-content: center;">
                    <button id="btn-confirmar-eliminar" 
                            style="padding: 0.8rem 2rem; background: #1976d2; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; min-width: 120px; transition: all 0.3s;">
                        Eliminar
                    </button>
                    <button id="btn-cancelar-eliminar" 
                            style="padding: 0.8rem 2rem; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; min-width: 120px; transition: all 0.3s;">
                        Cancelar
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modalConfirm);
        
        // Event listeners
        modalConfirm.querySelector('#btn-confirmar-eliminar').onclick = () => {
            confirmResult = true;
            modalConfirm.remove();
            if (confirmResolve) confirmResolve(true);
        };
        
        modalConfirm.querySelector('#btn-cancelar-eliminar').onclick = () => {
            confirmResult = false;
            modalConfirm.remove();
            if (confirmResolve) confirmResolve(false);
        };
        
        // Esperar a que el usuario responda
        const confirmado = await new Promise((resolve) => {
            confirmResolve = resolve;
        });
        
        if (!confirmado) {
            console.log('❌ Eliminación cancelada');
            return;
        }
        
        console.log('✅ Eliminación confirmada');
        
        // 3. Eliminar de localStorage
        usuarios = usuarios.filter(u => u.id !== usuarioId);
        localStorage.setItem('pincelart_users', JSON.stringify(usuarios));
        console.log('✅ Eliminado de localStorage');
        
        // 4. Eliminar de Firebase (opcional, sin bloquear)
        if (window.firebaseService && window.firebaseService.initialized) {
            try {
                await window.firebaseService.deleteUser(usuarioId);
                console.log('✅ Eliminado de Firebase');
            } catch (err) {
                console.log('⚠️ Error en Firebase (continuando):', err.message);
            }
        }
        
        // 5. Mensaje de éxito
        mostrarMensaje('¡Éxito!', `"${usuario.name}" eliminado correctamente.`, 'success');
        
        // 6. Actualizar lista DESPUÉS del mensaje
        setTimeout(() => {
            const modalUsuarios = document.getElementById('modal-gestion-usuarios');
            if (modalUsuarios) {
                const listaDiv = modalUsuarios.querySelector('#lista-usuarios');
                if (listaDiv) {
                    const usuariosActualizados = JSON.parse(localStorage.getItem('pincelart_users')) || [];
                    const currentUser = JSON.parse(localStorage.getItem('pincelart_current_user'));
                    listaDiv.innerHTML = generarListaUsuariosNueva(usuariosActualizados, currentUser);
                    console.log('✅ Lista actualizada en el modal');
                }
            }
        }, 800);
        
    } catch (error) {
        console.error('❌ ERROR:', error);
        mostrarMensaje('Error', 'Error al eliminar: ' + error.message, 'error');
    }
}

function cerrarModalGestionUsuarios() {
    // Cerrar modal de gestión de usuarios por ID
    const modal = document.getElementById('modal-gestion-usuarios');
    if (modal) {
        modal.remove();
        console.log('✅ Modal de gestión de usuarios cerrado');
    }
}

function cerrarModalProductos() {
    // Cerrar todos los modales relacionados con productos
    const modales = document.querySelectorAll('.modal-productos, .modal-crear-producto, .modal-editar-producto');
    modales.forEach(modal => modal.remove());
    
    console.log('✅ Modales de productos cerrados');
}

// Funciones para gestión de productos
function editarProducto(productoId) {
    console.log('🔄 Editando producto:', productoId);
    
    // Verificar permisos del usuario actual
    const currentUser = JSON.parse(localStorage.getItem('pincelart_current_user'));
    const rolValido = currentUser && (
        currentUser.rol === 'administrador' ||
        currentUser.rol === 'super_usuario' ||
        currentUser.rol === 'dueño' ||
        currentUser.rol === 'Dueño' ||
        currentUser.rol === 'vendedor' ||
        currentUser.rol === 'Vendedor' ||
        currentUser.id === 'super_user_001' ||
        currentUser.id === 'admin_001'
    );
    
    if (!rolValido) {
        mostrarMensaje('Error', 'No tienes permisos para editar productos.', 'error');
        return;
    }
    
    // Obtener productos desde Firebase o localStorage
    let productos = [];
    if (window.firebaseService && window.firebaseService.initialized) {
        window.firebaseService.getAllProducts().then(result => {
            if (result.success) {
                productos = result.data;
                const producto = productos.find(p => p.id === productoId);
                if (producto) {
                    mostrarModalEditarProducto(producto);
                } else {
                    mostrarMensaje('Error', 'Producto no encontrado.', 'error');
                }
            }
        });
    } else {
        productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        const producto = productos.find(p => p.id === productoId);
        if (producto) {
            mostrarModalEditarProducto(producto);
        } else {
            mostrarMensaje('Error', 'Producto no encontrado.', 'error');
        }
    }
}

async function eliminarProducto(productoId) {
    console.log('🔄 Eliminando producto:', productoId);
    
    // Verificar permisos del usuario actual
    const currentUser = JSON.parse(localStorage.getItem('pincelart_current_user'));
    const rolValido = currentUser && (
        currentUser.rol === 'administrador' ||
        currentUser.rol === 'super_usuario' ||
        currentUser.rol === 'dueño' ||
        currentUser.rol === 'Dueño' ||
        currentUser.rol === 'vendedor' ||
        currentUser.rol === 'Vendedor' ||
        currentUser.id === 'super_user_001' ||
        currentUser.id === 'admin_001'
    );
    
    if (!rolValido) {
        mostrarMensaje('Error', 'No tienes permisos para eliminar productos.', 'error');
        return;
    }
    
    // Obtener información del producto para la confirmación
    let producto = null;
    
    if (window.firebaseService && window.firebaseService.initialized) {
        const resultado = await window.firebaseService.getAllProducts();
        if (resultado.success) {
            producto = resultado.data.find(p => p.id === productoId);
        }
    }
    
    // Si no se encuentra en Firebase, buscar en localStorage
    if (!producto) {
        const productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        producto = productos.find(p => p.id === productoId);
    }
    
    if (!producto) {
        mostrarMensaje('Error', 'Producto no encontrado.', 'error');
        return;
    }
    
    // Mostrar confirmación con modal inline (igual que usuarios)
    console.log('💬 Mostrando confirmación...');
    
    // Crear modal de confirmación
    const modalConfirm = document.createElement('div');
    modalConfirm.id = 'modal-confirm-eliminar-producto';
    modalConfirm.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.6); z-index: 10002;
        display: flex; align-items: center; justify-content: center;
    `;
    
    let confirmResult = null;
    let confirmResolve = null;
    
    modalConfirm.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 400px; width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.4); text-align: center;">
            <div style="margin-bottom: 1.5rem;">
                <div style="width: 60px; height: 60px; background: #f44336; border-radius: 50%; margin: 0 auto 1rem; display: flex; align-items: center; justify-content: center;">
                    <i class="fas fa-trash-alt" style="font-size: 2rem; color: white;"></i>
                </div>
                <h3 style="margin: 0 0 0.5rem 0; color: #333; font-size: 1.4rem; font-weight: 700;">Confirmar Eliminación</h3>
                <p style="margin: 0; color: #666; font-size: 1rem; line-height: 1.5;">
                    ¿Eliminar el producto<br><strong style="color: #1976d2;">${producto.nombre}</strong>?<br><br>
                    <small style="color: #999;">Esta acción no se puede deshacer.</small>
                </p>
            </div>
            <div style="display: flex; gap: 1rem; justify-content: center;">
                <button id="btn-confirmar-eliminar-producto" 
                        style="padding: 0.8rem 2rem; background: #1976d2; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; min-width: 120px; transition: all 0.3s;">
                    Eliminar
                </button>
                <button id="btn-cancelar-eliminar-producto" 
                        style="padding: 0.8rem 2rem; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600; min-width: 120px; transition: all 0.3s;">
                    Cancelar
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalConfirm);
    
    // Event listeners
    modalConfirm.querySelector('#btn-confirmar-eliminar-producto').onclick = () => {
        confirmResult = true;
        modalConfirm.remove();
        if (confirmResolve) confirmResolve(true);
    };
    
    modalConfirm.querySelector('#btn-cancelar-eliminar-producto').onclick = () => {
        confirmResult = false;
        modalConfirm.remove();
        if (confirmResolve) confirmResolve(false);
    };
    
    // Esperar a que el usuario responda
    const confirmacion = await new Promise((resolve) => {
        confirmResolve = resolve;
    });
    
    if (!confirmacion) {
        console.log('❌ Eliminación de producto cancelada');
        return;
    }
    
    console.log('✅ Eliminación de producto confirmada');
    
    try {
        // Obtener imagen del producto para eliminar todos los duplicados
        const imagenProducto = producto.imagen;
        
        // Eliminar de localStorage PRIMERO (todos los duplicados)
        const productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        console.log(`📦 Total de productos en localStorage: ${productos.length}`);
        
        // Encontrar todos los productos con el mismo ID O la misma imagen
        const productosAEliminar = productos.filter(p => p.id === productoId || p.imagen === imagenProducto);
        console.log(`🗑️ Productos a eliminar (mismo ID o imagen): ${productosAEliminar.length}`);
        
        // Guardar IDs de los productos a eliminar
        const idsAEliminar = productosAEliminar.map(p => p.id);
        console.log(`🆔 IDs a eliminar:`, idsAEliminar);
        
        // Filtrar productos (eliminar todos los duplicados)
        const productosActualizados = productos.filter(p => !idsAEliminar.includes(p.id));
        localStorage.setItem('pincelart_productos', JSON.stringify(productosActualizados));
        console.log(`✅ ${productosAEliminar.length} producto(s) eliminado(s) de localStorage`);
        
        // Eliminar de Firebase (todos los duplicados por ID)
        if (window.firebaseService && window.firebaseService.initialized) {
            console.log('🔥 Eliminando de Firebase...');
            
            // Obtener todos los productos de Firebase
            const resultado = await window.firebaseService.getAllProducts();
            if (resultado.success) {
                const productosFirebase = resultado.data;
                
                // Encontrar productos duplicados en Firebase
                const productosFirebaseAEliminar = productosFirebase.filter(p => 
                    idsAEliminar.includes(p.id) || p.imagen === imagenProducto
                );
                
                console.log(`🔥 Productos a eliminar de Firebase: ${productosFirebaseAEliminar.length}`);
                
                // Eliminar cada uno de Firebase
                for (const productoEliminar of productosFirebaseAEliminar) {
                    try {
                        await window.firebaseService.deleteProduct(productoEliminar.id);
                        console.log(`✅ Eliminado de Firebase: ${productoEliminar.id}`);
                    } catch (err) {
                        console.error(`❌ Error eliminando ${productoEliminar.id} de Firebase:`, err);
                    }
                }
            }
        }
        
        mostrarMensaje('¡Éxito!', 'Producto eliminado exitosamente.', 'success');
        
        // Disparar evento para actualizar catálogo
        const productosRestantes = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        window.dispatchEvent(new CustomEvent('productos-actualizados', { 
            detail: { productos: productosRestantes } 
        }));
        
        // Actualizar la lista DESPUÉS de un pequeño delay
        setTimeout(async () => {
            const modalProductos = document.querySelector('.modal-productos');
            if (modalProductos) {
                const listaDiv = modalProductos.querySelector('#lista-productos');
                if (listaDiv) {
                    // Obtener productos actualizados
                    const productosActualizados = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
                    
                    // Actualizar productosTodos y filtros
                    productosTodos = productosActualizados;
                    
                    // ACTUALIZAR FILTROS DINÁMICOS CON NUEVAS CATEGORÍAS
                    const filtrosContainer = modalProductos.querySelector('#filtros-dinamicos');
                    if (filtrosContainer) {
                        const categorias = [...new Set(productosActualizados.map(p => p.categoria))];
                        const todosBtn = filtrosContainer.querySelector('[data-categoria="todos"]');
                        filtrosContainer.innerHTML = '';
                        filtrosContainer.appendChild(todosBtn);
                        
                        categorias.forEach(categoria => {
                            const cantidad = productosActualizados.filter(p => p.categoria === categoria).length;
                            const btn = document.createElement('button');
                            btn.className = 'filtro-categoria';
                            btn.dataset.categoria = categoria.toLowerCase();
                            btn.textContent = `${categoria} (${cantidad})`;
                            btn.style.cssText = 'padding: 0.5rem 1rem; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer; font-weight: 500;';
                            btn.addEventListener('click', function() {
                                const todosLosFiltros = modalProductos.querySelectorAll('.filtro-categoria');
                                todosLosFiltros.forEach(f => {
                                    f.style.background = '#e0e0e0';
                                    f.style.color = '#333';
                                    f.style.fontWeight = 'normal';
                                });
                                this.style.background = '#1976d2';
                                this.style.color = 'white';
                                this.style.fontWeight = '600';
                                filtrarProductosPorCategoria(modalProductos, categoria.toLowerCase());
                            });
                            filtrosContainer.appendChild(btn);
                        });
                        
                        console.log('✅ Filtros actualizados después de eliminar');
                    }
                    
                    // Recargar productos desde carpetas locales (actualizado)
                    await cargarProductosEnModal(modalProductos);
                    
                    console.log('✅ Lista de productos actualizada');
                }
            }
        }, 800);
        
    } catch (error) {
        console.error('❌ Error eliminando producto:', error);
        mostrarMensaje('Error', 'Ocurrió un error inesperado al eliminar el producto.', 'error');
    }
}

// Función helper para obtener opciones de categoría dinámicamente
function obtenerOpcionesCategoria(categoriaActual) {
    const productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
    const categorias = [...new Set(productos.map(p => p.categoria).filter(c => c))];
    
    let html = '';
    categorias.forEach(cat => {
        const selected = cat === categoriaActual ? 'selected' : '';
        html += `<option value="${cat}" ${selected}>${cat}</option>`;
    });
    
    // Si la categoría actual no está en la lista, agregarla
    if (categoriaActual && !categorias.includes(categoriaActual)) {
        html = `<option value="${categoriaActual}" selected>${categoriaActual}</option>` + html;
    }
    
    return html;
}

function mostrarModalEditarProducto(producto) {
    console.log('🔄 Mostrando modal de editar producto:', producto);
    
    const modal = document.createElement('div');
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: center;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 600px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: #1976d2;">Editar Producto</h3>
                <button onclick="cerrarModalEditarProducto()" style="padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: 600;">Cerrar</button>
            </div>
            <form id="form-editar-producto" style="display: grid; gap: 1rem;">
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Nombre del Producto</label>
                    <input type="text" name="nombre" value="${producto.nombre}" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Descripción</label>
                    <textarea name="descripcion" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; min-height: 80px;">${producto.descripcion}</textarea>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Categoría</label>
                    <select name="categoria" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        ${obtenerOpcionesCategoria(producto.categoria)}
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Precio</label>
                    <input type="number" name="precio" value="${producto.precio}" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Stock</label>
                    <input type="number" name="stock" value="${producto.stock}" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Estado</label>
                    <select name="estado" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        <option value="activo" ${producto.estado === 'activo' ? 'selected' : ''}>Activo</option>
                        <option value="inactivo" ${producto.estado === 'inactivo' ? 'selected' : ''}>Inactivo</option>
                    </select>
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Imagen Actual</label>
                    <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 100%; max-width: 200px; border-radius: 8px; border: 2px solid #e0e0e0;" onerror="this.src='images/Logo/logo-pincelart.jpg'">
                </div>
                <div>
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Cambiar Imagen (opcional)</label>
                    <input type="file" name="imagen" accept="image/*" style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    <small style="color: #666; display: block; margin-top: 0.5rem;">Selecciona una nueva imagen para el producto</small>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button type="submit" style="flex: 1; padding: 0.8rem; background: #4caf50; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Guardar Cambios</button>
                    <button type="button" onclick="limpiarFormularioEditarProducto()" style="flex: 1; padding: 0.8rem; background: #ff9800; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Limpiar</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    modal.className = 'modal-editar-producto';
    
    // Agregar event listener al formulario
    const form = modal.querySelector('#form-editar-producto');
    console.log('📝 Formulario encontrado:', form);
    console.log('📝 ID del producto:', producto.id);
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('🎯 Evento submit capturado!');
        console.log('🔄 Llamando a actualizarProducto...');
        await actualizarProducto(producto.id, form);
    });
    
    console.log('✅ Event listener agregado al formulario');
}

async function actualizarProducto(productoId, form) {
    try {
        console.log('🔄 INICIANDO ACTUALIZACIÓN DE PRODUCTO:', productoId);
        
        const formData = new FormData(form);
        
        // Obtener datos del producto ORIGINAL primero
        const productosActuales = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        const productoOriginal = productosActuales.find(p => p.id === productoId);
        
        const productoActualizado = {
            nombre: formData.get('nombre').trim(),
            descripcion: formData.get('descripcion').trim(),
            categoria: formData.get('categoria'),
            precio: parseInt(formData.get('precio')),
            stock: parseInt(formData.get('stock')),
            estado: formData.get('estado'),
            fechaActualizacion: new Date().toISOString(),
            // Mantener la imagen actual por defecto
            imagen: productoOriginal ? productoOriginal.imagen : ''
        };
        
        console.log('📝 Datos del producto actualizado:', productoActualizado);
        
        // Si hay una nueva imagen, procesarla y reemplazar
        const nuevaImagen = formData.get('imagen');
        if (nuevaImagen && nuevaImagen.size > 0) {
            console.log('📸 Procesando nueva imagen seleccionada...');
            const imagenUrl = await procesarImagenNueva(nuevaImagen, productoId);
            productoActualizado.imagen = imagenUrl;
            console.log('✅ Nueva imagen asignada al producto');
        } else {
            console.log('🖼️ Manteniendo imagen actual');
        }
        
        // Validar campos
        if (!productoActualizado.nombre || !productoActualizado.descripcion || !productoActualizado.precio || productoActualizado.stock < 0) {
            mostrarMensaje('Error', 'Todos los campos son obligatorios y el stock debe ser mayor o igual a 0.', 'error');
            return;
        }
        
        // ==========================================
        // ACTUALIZAR EN FIREBASE
        // ==========================================
        if (window.firebaseService && window.firebaseService.initialized) {
            console.log('🔥 Actualizando producto en Firebase:', productoId);
            try {
                const resultado = await window.firebaseService.updateProduct(productoId, productoActualizado);
                if (resultado && resultado.success) {
                    console.log('✅ Producto actualizado en Firebase exitosamente');
                } else {
                    console.error('❌ Error actualizando en Firebase:', resultado);
                }
            } catch (error) {
                console.error('❌ Error actualizando en Firebase:', error);
            }
        } else {
            console.warn('⚠️ Firebase no está inicializado, guardando solo en localStorage');
        }
        
        // Obtener productos actuales
        const productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        const productoIndex = productos.findIndex(p => p.id === productoId);
        
        if (productoIndex === -1) {
            mostrarMensaje('Error', 'Producto no encontrado.', 'error');
            return;
        }
        
        // Actualizar el producto existente con los nuevos datos
        const productoExistente = productos[productoIndex];
        const productoActualizadoCompleto = {
            ...productoExistente,
            ...productoActualizado,
            id: productoId,
            // Mantener imagen actual si no hay nueva
            imagen: productoActualizado.imagen || productoExistente.imagen
        };
        
        // Actualizar en localStorage
        productos[productoIndex] = productoActualizadoCompleto;
        localStorage.setItem('pincelart_productos', JSON.stringify(productos));
        console.log('✅ Producto actualizado en localStorage:', productoActualizadoCompleto);
        
        mostrarMensaje('¡Éxito!', 'Producto actualizado exitosamente.', 'success');
        
        // Cerrar modal de edición INMEDIATAMENTE
        const modalEdicion = document.querySelector('.modal-editar-producto');
        if (modalEdicion) {
            modalEdicion.remove();
        }
        
        // Actualizar lista en el modal de gestión INMEDIATAMENT*mabién:
        const modalGestion = document.querySelector('.modal-productos');
        if (modalGestion) {
            // Guardar la categoría DEL PRODUCTO ACTUALIZADO
            const categoriaDelProductoActualizado = productoActualizadoCompleto.categoria;
            
            // Actualizar arrays globales
            productosTodos = productos;
            
            // ACTUALIZAR filtros dinámicamente (elimina categorías vacías, agrega nuevas)
            actualizarFiltrosCategoriasEnModal(modalGestion, productos);
            
            // IMPORTANTE: Filtrar por la categoría DEL PRODUCTO que se acaba de actualizar
            let productosParaMostrar = [];
            const categoriasExistentes = [...new Set(productos.map(p => p.categoria.toLowerCase()))];
            
            // Si la categoría del producto existe, filtrar por ella
            if (categoriaDelProductoActualizado && categoriasExistentes.includes(categoriaDelProductoActualizado.toLowerCase())) {
                productosParaMostrar = productos.filter(p => p.categoria.toLowerCase() === categoriaDelProductoActualizado.toLowerCase());
                productosFiltradosActuales = productosParaMostrar;
                
                console.log(`✅ Filtrando por categoría del producto: ${categoriaDelProductoActualizado}`);
            } else {
                // Si no existe esa categoría, mostrar todos
                productosParaMostrar = productos;
                productosFiltradosActuales = productos;
            }
            
            // Renderizar lista con productos filtrados
            renderizarListaProductos(modalGestion, productosParaMostrar);
            
            // Activar el filtro de la categoría del producto actualizado
            setTimeout(() => {
                const todosLosFiltros = modalGestion.querySelectorAll('.filtro-categoria');
                let filtroActivado = null;
                
                todosLosFiltros.forEach(f => {
                    f.style.background = '#e0e0e0';
                    f.style.color = '#333';
                    f.style.fontWeight = 'normal';
                    
                    // Si este filtro coincide con la categoría del producto, activarlo
                    if (categoriaDelProductoActualizado && 
                        f.dataset.categoria.toLowerCase() === categoriaDelProductoActualizado.toLowerCase()) {
                        filtroActivado = f;
                    }
                });
                
                // Activar el filtro correcto
                if (filtroActivado) {
                    filtroActivado.style.background = '#1976d2';
                    filtroActivado.style.color = 'white';
                    filtroActivado.style.fontWeight = '600';
                    console.log(`✅ Filtro activado: ${filtroActivado.dataset.categoria}`);
                } else {
                    // Si no hay filtro para esa categoría, activar "Todos"
                    const todosBtn = modalGestion.querySelector('[data-categoria="todos"]');
                    if (todosBtn) {
                        todosBtn.style.background = '#1976d2';
                        todosBtn.style.color = 'white';
                        todosBtn.style.fontWeight = '600';
                    }
                }
            }, 50);
        }
        
        // Disparar evento para actualizar catálogo en tiempo real
        window.dispatchEvent(new CustomEvent('productos-actualizados', { 
            detail: { productos } 
        }));
        
        // Limpiar formulario pero mantener modal abierto
        form.reset();
        
    } catch (error) {
        console.error('❌ Error actualizando producto:', error);
        mostrarMensaje('Error', 'Ocurrió un error inesperado al actualizar el producto.', 'error');
    }
}

// Función para mostrar formulario de crear producto
function mostrarAgregarProducto() {
    console.log('➕ Mostrando formulario para crear producto...');
    
    // Cerrar otros modales
    cerrarTodosLosModales();
    
    const modal = document.createElement('div');
    modal.className = 'modal-crear-producto';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
    `;
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 600px; width: 90%; max-height: 90vh; overflow-y: auto;">
            <h2 style="margin-bottom: 1.5rem; color: #1976d2;">Crear Nuevo Producto</h2>
            
            <form id="form-crear-producto">
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Nombre del Producto *</label>
                    <input type="text" name="nombre" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Descripción *</label>
                    <textarea name="descripcion" required rows="3" style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; font-family: inherit;"></textarea>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Categoría *</label>
                    <select name="categoria" style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem; margin-bottom: 0.5rem;">
                        <option value="">Selecciona una categoría existente (opcional)</option>
                        <option value="Ropa">Ropa</option>
                        <option value="Accesorios">Accesorios</option>
                        <option value="Hogar">Hogar</option>
                    </select>
                    <div style="margin: 0.5rem 0; text-align: center;">
                        <span style="color: #666; font-size: 0.9rem;">O</span>
                    </div>
                    <input type="text" name="categoria-nueva" placeholder="Escribe una nueva categoría" style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    <small style="color: #666; display: block; margin-top: 0.5rem;">Debes completar una opción: seleccionar existente o escribir nueva</small>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Precio *</label>
                        <input type="number" name="precio" required min="0" style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                    <div>
                        <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Stock *</label>
                        <input type="number" name="stock" required min="0" style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    </div>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Estado</label>
                    <select name="estado" style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                        <option value="activo" selected>Activo</option>
                        <option value="inactivo">Inactivo</option>
                    </select>
                </div>
                
                <div style="margin-bottom: 1rem;">
                    <label style="display: block; margin-bottom: 0.5rem; font-weight: 600; color: #333;">Imagen del Producto *</label>
                    <input type="file" name="imagen" accept="image/*" required style="width: 100%; padding: 0.8rem; border: 2px solid #e0e0e0; border-radius: 8px; font-size: 1rem;">
                    <small style="color: #666; display: block; margin-top: 0.5rem;">Selecciona una imagen para el producto</small>
                </div>
                
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button type="submit" style="flex: 1; padding: 0.8rem; background: #4caf50; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Crear Producto</button>
                    <button type="button" onclick="this.closest('.modal-crear-producto').remove()" style="flex: 1; padding: 0.8rem; background: #ff9800; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listener para el formulario
    const form = modal.querySelector('#form-crear-producto');
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log('🎯 Evento submit capturado para crear producto!');
        await crearProducto(form);
    });
    
    console.log('✅ Modal de crear producto mostrado');
}

// Función para crear nuevo producto
async function crearProducto(form) {
    try {
        console.log('➕ CREANDO NUEVO PRODUCTO...');
        
        const formData = new FormData(form);
        
        // Validar campos obligatorios básicos
        if (!formData.get('nombre') || !formData.get('descripcion') || !formData.get('precio') || !formData.get('stock')) {
            mostrarMensaje('Error', 'Todos los campos son obligatorios.', 'error');
            return;
        }
        
        // Determinar categoría (nueva o existente)
        const categoriaSelect = formData.get('categoria');
        const categoriaNueva = formData.get('categoria-nueva').trim();
        
        let categoria;
        if (categoriaNueva) {
            // Si escribió una nueva categoría, usar esa
            categoria = categoriaNueva;
            console.log('✨ Nueva categoría creada:', categoria);
        } else if (categoriaSelect) {
            // Si seleccionó una existente, usar esa
            categoria = categoriaSelect;
            console.log('✅ Usando categoría existente:', categoria);
        } else {
            // No seleccionó ni escribió categoría
            mostrarMensaje('Error', 'Debe seleccionar una categoría existente o escribir una nueva.', 'error');
            return;
        }
        
        // Generar ID único
        const productoId = `producto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const nuevoProducto = {
            id: productoId,
            nombre: formData.get('nombre').trim(),
            descripcion: formData.get('descripcion').trim(),
            categoria: categoria,
            precio: parseInt(formData.get('precio')),
            stock: parseInt(formData.get('stock')),
            estado: 'activo', // SIEMPRE activo al crear (para que se vea en catálogo)
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
        };
        
        // Procesar imagen
        const imagenFile = formData.get('imagen');
        if (imagenFile && imagenFile.size > 0) {
            console.log('📸 Procesando imagen...');
            const imagenUrl = await procesarImagenNueva(imagenFile, productoId);
            nuevoProducto.imagen = imagenUrl;
        } else {
            nuevoProducto.imagen = 'images/Logo/logo-pincelart.jpg'; // Imagen por defecto
        }
        
        // Guardar en localStorage
        const productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        productos.push(nuevoProducto);
        localStorage.setItem('pincelart_productos', JSON.stringify(productos));
        console.log('✅ Producto guardado en localStorage');
        
        // Intentar guardar en Firebase
        if (window.firebaseService && window.firebaseService.initialized) {
            try {
                await window.firebaseService.addProduct(nuevoProducto);
                console.log('✅ Producto guardado en Firebase');
            } catch (error) {
                console.warn('⚠️ Error guardando en Firebase:', error);
            }
        }
        
        mostrarMensaje('¡Éxito!', 'Producto creado exitosamente.', 'success');
        
        console.log('📦 Total productos después de crear:', productos.length);
        console.log('🆕 Producto creado:', nuevoProducto.nombre, 'en categoría:', nuevoProducto.categoria);
        
        // Cerrar modal de crear
        document.querySelector('.modal-crear-producto').remove();
        
        // Abrir automáticamente Gestión de Productos
        let modalGestion = document.querySelector('.modal-productos');
        if (!modalGestion) {
            console.log('🔄 Abriendo Gestión de Productos automáticamente...');
            await mostrarGestionProductos();
            modalGestion = document.querySelector('.modal-productos');
            
            // Esperar un momento para que el modal se renderice
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        // Recargar la lista de productos COMPLETAMENTE
        if (modalGestion) {
            console.log('🔄 Recargando lista de productos...');
            await cargarProductosEnModal(modalGestion);
            
            // Actualizar variables globales
            productosTodos = productos;
            productosFiltradosActuales = productos;
            
            // CAMBIAR FILTRO A "TODOS" para mostrar el nuevo producto
            setTimeout(() => {
                const filtroTodos = modalGestion.querySelector('.filtro-categoria[data-categoria="todos"]');
                if (filtroTodos) {
                    console.log('✅ Cambiando filtro a "Todos" para mostrar nuevo producto...');
                    
                    // Aplicar estilo activo manualmente
                    const todosLosFiltros = modalGestion.querySelectorAll('.filtro-categoria');
                    todosLosFiltros.forEach(f => {
                        f.style.background = '#e0e0e0';
                        f.style.color = '#333';
                        f.style.fontWeight = 'normal';
                    });
                    filtroTodos.style.background = '#1976d2';
                    filtroTodos.style.color = 'white';
                    filtroTodos.style.fontWeight = '600';
                    
                    // Filtrar productos
                    filtrarProductosPorCategoria(modalGestion, 'todos');
                }
            }, 100);
            
            // Renderizar TODOS los productos
            renderizarListaProductos(modalGestion, productos);
            
            // Hacer scroll al final para ver el nuevo producto
            const listaProductos = modalGestion.querySelector('#lista-productos');
            if (listaProductos) {
                setTimeout(() => {
                    listaProductos.scrollTop = listaProductos.scrollHeight;
                }, 100);
            }
            
            console.log('✅ Lista actualizada con', productos.length, 'productos');
        }
        
        // Disparar evento para actualizar catálogo
        window.dispatchEvent(new CustomEvent('productos-actualizados', { 
            detail: { productos } 
        }));
        
        console.log('✅ Producto creado y eventos disparados');
        
    } catch (error) {
        console.error('❌ Error creando producto:', error);
        mostrarMensaje('Error', 'Ocurrió un error al crear el producto.', 'error');
    }
}
