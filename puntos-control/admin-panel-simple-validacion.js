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
        } catch (error) {
            console.error('❌ Error inicializando Firebase Service:', error);
        }
    }
    
    // Cargar información del usuario
    cargarInformacionUsuario();
    
    // Cargar estadísticas
    cargarEstadisticas();
    
    // Ejecutar limpieza y migración automática de productos
    ejecutarLimpiezaYMigracionAutomatica();
    
    // Validar y limpiar productos automáticamente
    validarYLimpiarProductos();
    
    console.log('✅ Panel inicializado');
});

function cargarInformacionUsuario() {
    try {
        const currentUser = JSON.parse(localStorage.getItem('pincelart_current_user'));
        
        if (currentUser) {
            const userNameElement = document.getElementById('admin-user-name');
            if (userNameElement) {
                userNameElement.textContent = currentUser.name;
            }
            console.log('✅ Usuario cargado:', currentUser.name);
        } else {
            window.location.href = 'login.html';
        }
    } catch (error) {
        console.error('❌ Error cargando usuario:', error);
    }
}

function cargarEstadisticas() {
    try {
        const users = JSON.parse(localStorage.getItem('pincelart_users')) || [];
        const productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        
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
        
        console.log('✅ Estadísticas cargadas');
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
            
            if (!tieneNombre) {
                productosSinNombre.push(producto.id);
            }
            
            if (!tieneImagen) {
                productosSinImagen.push(producto.id);
            }
            
            if (tieneNombre && tieneImagen) {
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
                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                    <button class="filtro-categoria" data-categoria="todos" style="padding: 0.5rem 1rem; background: #1976d2; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">Todos</button>
                    <button class="filtro-categoria" data-categoria="ropa" style="padding: 0.5rem 1rem; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer;">Ropa</button>
                    <button class="filtro-categoria" data-categoria="accesorios" style="padding: 0.5rem 1rem; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer;">Accesorios</button>
                    <button class="filtro-categoria" data-categoria="hogar" style="padding: 0.5rem 1rem; background: #e0e0e0; color: #333; border: none; border-radius: 8px; cursor: pointer;">Hogar</button>
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
        
        if (window.firebaseService && window.firebaseService.initialized) {
            console.log('🔥 Obteniendo productos desde Firebase...');
            const result = await window.firebaseService.getAllProducts();
            if (result.success) {
                productos = result.data;
                console.log(`✅ ${productos.length} productos obtenidos de Firebase`);
                
                // También sincronizar con localStorage
                localStorage.setItem('pincelart_productos', JSON.stringify(productos));
            }
        } else {
            console.log('💾 Obteniendo productos desde localStorage...');
            productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
            console.log(`✅ ${productos.length} productos obtenidos de localStorage`);
        }
        
        // Guardar todos los productos para filtrar
        productosTodos = productos;
        productosFiltradosActuales = [...productos];
        
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
    
    if (productos.length === 0) {
        listaProductos.innerHTML = '<p>No hay productos disponibles. Haz clic en "Agregar Producto" para crear uno nuevo.</p>';
        const contador = modal.querySelector('#contador-productos');
        if (contador) contador.textContent = '0';
        return;
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
                                <span style="color: ${producto.estado === 'activo' ? '#4caf50' : '#f44336'}; font-weight: 600;">
                                    ${producto.estado === 'activo' ? '✓ Activo' : '✗ Inactivo'}
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
                                <span style="color: ${producto.estado === 'activo' ? '#4caf50' : '#f44336'}; font-weight: 600;">
                                    ${producto.estado === 'activo' ? '✓ Activo' : '✗ Inactivo'}
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
    
    if (categoria !== 'todos') {
        productosFiltrados = productosTodos.filter(p => p.categoria === categoria);
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
        currentUser.id === 'super_user_001' ||
        currentUser.id === 'admin_001'
    );
    
    if (!rolValido) {
        mostrarMensaje('Error', 'Solo el administrador puede agregar productos.', 'error');
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
            estado: formData.get('estado'),
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
        };
        
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
                    nuevoProducto.imagen = await window.firebaseService.uploadImage(imagenFile, productoId);
                    nuevoProducto.id = productoId;
                } catch (error) {
                    console.error('Error subiendo imagen:', error);
                    nuevoProducto.imagen = null;
                    nuevoProducto.id = productoId;
                }
            } else {
                // Fallback: guardar como base64
                const reader = new FileReader();
                reader.onload = function(e) {
                    nuevoProducto.imagen = e.target.result;
                };
                reader.readAsDataURL(imagenFile);
                nuevoProducto.id = productoId;
            }
        } else {
            nuevoProducto.id = `producto-${Date.now()}`;
            nuevoProducto.imagen = 'images/Logo/logo-pincelart.jpg';
        }
        
        // Guardar producto en Firebase
        if (window.firebaseService && window.firebaseService.initialized) {
            await window.firebaseService.addProduct(nuevoProducto);
        }
        
        // Guardar en localStorage también
        const productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        productos.push(nuevoProducto);
        localStorage.setItem('pincelart_productos', JSON.stringify(productos));
        
        mostrarMensaje('¡Éxito!', 'Producto creado exitosamente.', 'success');
        
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
    
    const puedeGestionar = currentUser.rol === 'administrador' || 
                          currentUser.rol === 'super_usuario' ||
                          currentUser.id === 'super_user_001';
    
    if (!puedeGestionar) {
        mostrarMensaje('Error', 'Solo el administrador puede gestionar usuarios.', 'error');
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
                     currentUser.id === 'super_user_001' ||
                     currentUser.id === 'admin_001';
    
    if (!rolValido) {
        mostrarMensaje('Error', `Solo el administrador puede crear usuarios. Tu rol actual es: "${currentUser.rol}"`, 'error');
        return;
    }
    
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
                        <option value="dueño">Dueño</option>
                        <option value="administrador">Administrador</option>
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

function crearUsuario(form) {
    try {
        const formData = new FormData(form);
        
        const nuevoUsuario = {
            id: `user_${Date.now()}`,
            name: formData.get('nombre').trim(),
            email: formData.get('email').trim(),
            phone: formData.get('telefono').trim(),
            password: formData.get('password'),
            rol: formData.get('rol'),
            fechaCreacion: new Date().toISOString()
        };
        
        // Validar que todos los campos estén llenos
        if (!nuevoUsuario.name || !nuevoUsuario.email || !nuevoUsuario.phone || !nuevoUsuario.password) {
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
        if (usuarios.some(u => u.phone === nuevoUsuario.phone)) {
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
        if (!phoneRegex.test(nuevoUsuario.phone)) {
            mostrarMensaje('Error', 'El teléfono debe contener solo números y tener entre 7 y 15 dígitos.', 'error');
            return;
        }
        
        // Agregar nuevo usuario
        usuarios.push(nuevoUsuario);
        localStorage.setItem('pincelart_users', JSON.stringify(usuarios));
        
        // Guardar en Firebase si está disponible
        if (window.firebaseService && window.firebaseService.initialized) {
            window.firebaseService.saveUser(nuevoUsuario);
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
                               currentUser.id === 'super_user_001';
        
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
                    ${puedeGestionar ? `
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
        currentUser.id === 'super_user_001' ||
        currentUser.id === 'admin_001'
    );
    
    if (!rolValido) {
        mostrarMensaje('Error', 'Solo el administrador puede editar productos.', 'error');
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
        currentUser.id === 'super_user_001' ||
        currentUser.id === 'admin_001'
    );
    
    if (!rolValido) {
        mostrarMensaje('Error', 'Solo el administrador puede eliminar productos.', 'error');
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
        
        // Actualizar la lista DESPUÉS de un pequeño delay
        setTimeout(async () => {
            const modalProductos = document.querySelector('.modal-productos');
            if (modalProductos) {
                const listaDiv = modalProductos.querySelector('#lista-productos');
                if (listaDiv) {
                    // Obtener productos actualizados
                    const productosActualizados = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
                    
                    // Si no hay productos en localStorage, obtener de Firebase
                    if (productosActualizados.length === 0 && window.firebaseService && window.firebaseService.initialized) {
                        const resultado = await window.firebaseService.getAllProducts();
                        if (resultado.success) {
                            productosActualizados = resultado.data;
                        }
                    }
                    
                    // Regenerar HTML de la lista
                    listaDiv.innerHTML = renderizarListaProductosHTML(productosActualizados, modalProductos);
                    
                    // Actualizar contador
                    const contador = modalProductos.querySelector('#contador-productos');
                    if (contador) {
                        contador.textContent = productosActualizados.length;
                    }
                    
                    console.log('✅ Lista de productos actualizada');
                }
            }
        }, 800);
        
    } catch (error) {
        console.error('❌ Error eliminando producto:', error);
        mostrarMensaje('Error', 'Ocurrió un error inesperado al eliminar el producto.', 'error');
    }
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
                        <option value="ropa" ${producto.categoria === 'ropa' ? 'selected' : ''}>Ropa</option>
                        <option value="accesorios" ${producto.categoria === 'accesorios' ? 'selected' : ''}>Accesorios</option>
                        <option value="hogar" ${producto.categoria === 'hogar' ? 'selected' : ''}>Hogar</option>
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
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        actualizarProducto(producto.id, form);
    });
}

function actualizarProducto(productoId, form) {
    try {
        const formData = new FormData(form);
        
        const productoActualizado = {
            nombre: formData.get('nombre').trim(),
            descripcion: formData.get('descripcion').trim(),
            categoria: formData.get('categoria'),
            precio: parseInt(formData.get('precio')),
            stock: parseInt(formData.get('stock')),
            estado: formData.get('estado'),
            fechaActualizacion: new Date().toISOString()
        };
        
        // Validar campos
        if (!productoActualizado.nombre || !productoActualizado.descripcion || !productoActualizado.precio || productoActualizado.stock < 0) {
            mostrarMensaje('Error', 'Todos los campos son obligatorios y el stock debe ser mayor o igual a 0.', 'error');
            return;
        }
        
        // Actualizar en Firebase si está disponible
        if (window.firebaseService && window.firebaseService.initialized) {
            window.firebaseService.updateProduct(productoId, productoActualizado);
        }
        
        // Actualizar en localStorage también
        const productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        const productoIndex = productos.findIndex(p => p.id === productoId);
        if (productoIndex !== -1) {
            productos[productoIndex] = { ...productos[productoIndex], ...productoActualizado };
            localStorage.setItem('pincelart_productos', JSON.stringify(productos));
        }
        
        mostrarMensaje('¡Éxito!', 'Producto actualizado exitosamente.', 'success');
        
        // Limpiar formulario pero mantener modal abierto
        form.reset();
        
    } catch (error) {
        console.error('❌ Error actualizando producto:', error);
        mostrarMensaje('Error', 'Ocurrió un error inesperado al actualizar el producto.', 'error');
    }
}
