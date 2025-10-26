// Navegación suave entre secciones
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href').substring(1);
        
        // Si es una sección que existe, usar mostrarSeccion
        if (['inicio', 'productos', 'carrito', 'favoritos', 'contacto'].includes(targetId)) {
            mostrarSeccion(targetId);
        } else {
            // Para otros elementos, scroll normal
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
            }
        }
    });
});

// Variables globales para e-commerce
let carrito = [];
let favoritos = [];
let currentUser = null;
let productos = [];

// Inicializar Firebase Service
let firebaseService = null;

// Cuando la página carga
document.addEventListener('DOMContentLoaded', async function() {
    console.log('✅ PincelArt cargado');
    
    // Inicializar Firebase Service
    try {
        firebaseService = new FirebaseService();
        await firebaseService.init();
        window.firebaseService = firebaseService;
        console.log('🔥 Firebase Service inicializado');
    } catch (error) {
        console.error('❌ Error inicializando Firebase Service:', error);
    }
    
    // Verificar si hay usuario logueado
    checkUserSession();
    
    // Cargar productos (ahora es asíncrono)
    await cargarProductos();
    
    // Mostrar todas las secciones por defecto excepto carrito y favoritos
    // Solo aplicar esto si NO estamos en el panel de administración
    if (!window.location.pathname.includes('admin-panel.html')) {
    document.querySelectorAll('section').forEach(section => {
        if (section.id === 'carrito' || section.id === 'favoritos') {
            section.style.display = 'none';
        } else {
            section.style.display = 'block';
        }
    });
    
    // Asegurar que la sección de visión y misión esté visible
    const visionMision = document.getElementById('vision-mision');
    if (visionMision) {
        visionMision.style.display = 'block';
    }
    
    // Ocultar modal por defecto
    const modal = document.getElementById('modal-productos');
    if (modal) {
        modal.style.display = 'none';
    }
    
    // Activar filtros
    initFiltrosCategorias();
    
    // Activar funcionalidad de e-commerce
    initEcommerce();
    
    // SINCRONIZAR CATÁLOGO CON PRODUCTOS DE GESTIÓN
    actualizarCatalogoDesdeGestión();
    }
    
    // ESCUCHAR CAMBIOS EN PRODUCTOS DESDE ADMIN
    window.addEventListener('productos-actualizados', function(event) {
        console.log('📢 Evento productos-actualizados recibido');
        actualizarCatalogoDesdeGestión();
        
        // ACTUALIZAR FILTROS con nuevas categorías
        actualizarFiltrosCategorias();
    });
    
    // Función para actualizar filtros de categorías dinámicamente
    function actualizarFiltrosCategorias() {
        console.log('🔄 Actualizando filtros dinámicamente...');
        initFiltrosCategorias();
    }
    
    // Función para actualizar catálogo con datos de Gestión de Productos
    function actualizarCatalogoDesdeGestión() {
        // Cargar productos desde localStorage
        let productosGestion = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        
        if (productosGestion.length === 0) {
            console.log('⚠️ No hay productos en gestión');
            return;
        }
        
        // LIMPIAR DUPLICADOS - Usar solo productos únicos por ID
        const productosUnicos = [];
        const idsVistos = new Set();
        
        productosGestion.forEach(p => {
            if (!idsVistos.has(p.id)) {
                idsVistos.add(p.id);
                productosUnicos.push(p);
            }
        });
        
        console.log(`🔄 Sincronizando catálogo con ${productosUnicos.length} productos ÚNICOS de Gestión (antes: ${productosGestion.length})`);
        
        // ACTUALIZAR localStorage con TODOS los productos (para gestión)
        localStorage.setItem('pincelart_productos', JSON.stringify(productosUnicos));
        
        // FILTRAR: Solo productos ACTIVOS para el catálogo público
        const productosActivos = productosUnicos.filter(p => 
            p.estado === 'activo' || p.estado === 'disponible'
        );
        
        console.log(`👥 Catálogo público: ${productosActivos.length} productos activos de ${productosUnicos.length} totales`);
        
        // Trabajar con productos activos para actualizar el catálogo
        productosGestion = productosActivos;
        
        // Actualizar tarjetas principales
        document.querySelectorAll('.producto-card').forEach(tarjeta => {
            const dataProducto = tarjeta.getAttribute('data-producto');
            const dataCategoria = tarjeta.getAttribute('data-categoria');
            
            if (!dataProducto || !dataCategoria) return;
            
            // Buscar producto en localStorage que coincida
            const producto = productosGestion.find(p => {
                const imagenMatch = p.imagen && p.imagen.toLowerCase().includes(dataProducto.toLowerCase());
                const categoriaMatch = p.categoria === dataCategoria;
                return imagenMatch && categoriaMatch;
            });
            
            if (producto) {
                // Actualizar precio
                const precioEl = tarjeta.querySelector('.precio');
                if (precioEl) {
                    precioEl.textContent = `$${producto.precio.toLocaleString()}`;
                }
                
                // Actualizar stock
                const stockEls = tarjeta.querySelectorAll('small');
                stockEls.forEach(el => {
                    if (el.textContent.includes('Stock:')) {
                        el.textContent = `Stock: ${producto.stock || 1}`;
                    }
                });
                
                // Actualizar descripción
                const descEl = tarjeta.querySelector('p');
                if (descEl && producto.descripcion) {
                    descEl.textContent = producto.descripcion;
                }
                
                // Actualizar imagen SIEMPRE (sea Base64 o URL)
                if (producto.imagen) {
                    const imgEl = tarjeta.querySelector('img');
                    if (imgEl) {
                        imgEl.src = producto.imagen;
                        console.log(`🖼️ Imagen actualizada: ${producto.imagen.substring(0, 50)}...`);
                    }
                }
                
                console.log(`✅ Actualizado: ${dataProducto} - $${producto.precio}`);
            } else {
                console.log(`⚠️ No se encontró producto para: ${dataProducto} en categoría ${dataCategoria}`);
            }
        });
        
        // Actualizar productos globales SOLO con activos
        productos = productosActivos;
        console.log(`✅ Variable global 'productos' actualizada con ${productos.length} productos ACTIVOS`);
    }
    
// Debug para verificar imagen de pulsera (mejorado)
setTimeout(() => {
    const imgPulsera = document.querySelector('img[alt="Pulseras"]');
    if (imgPulsera) {
        console.log('=== DEBUG IMAGEN PULSERA ===');
        console.log('Imagen encontrada:', imgPulsera);
        console.log('Src:', imgPulsera.src);
        console.log('Alt:', imgPulsera.alt);
        console.log('Computed style display:', window.getComputedStyle(imgPulsera).display);
        console.log('Computed style visibility:', window.getComputedStyle(imgPulsera).visibility);
        console.log('Computed style opacity:', window.getComputedStyle(imgPulsera).opacity);
        
        imgPulsera.onload = function() {
            console.log('✅ Imagen de pulsera cargada correctamente');
        };
        imgPulsera.onerror = function() {
            console.log('❌ Error al cargar imagen de pulsera - Verificando ruta:', imgPulsera.src);
        };
    } else {
        console.log('⚠️ No se encontró la imagen de pulseras - Esto es normal si la página aún está cargando');
    }
}, 2000); // Aumentado a 2 segundos para dar más tiempo

// Función simple para mostrar el catálogo
function mostrarCatalogo() {
    const grid = document.querySelector('.grid-productos');
    const seccion = document.getElementById('productos');
    const tarjetas = document.querySelectorAll('.producto-card');
    const filtroTodos = document.querySelector('.filtro-btn[data-categoria="todos"]');
    
    if (grid) {
        grid.style.display = 'grid';
        grid.style.visibility = 'visible';
        grid.style.opacity = '1';
    }
    
    if (seccion) {
        seccion.style.display = 'block';
        seccion.style.visibility = 'visible';
        seccion.style.opacity = '1';
    }
    
    // Activar filtro "todos" para mostrar todas las tarjetas
    if (filtroTodos) {
        document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
        filtroTodos.classList.add('active');
    }
    
    tarjetas.forEach(tarjeta => {
        tarjeta.style.display = 'block';
        tarjeta.style.visibility = 'visible';
        tarjeta.style.opacity = '1';
        tarjeta.classList.remove('hidden');
    });
    
    console.log('Catálogo mostrado - todas las tarjetas visibles');
}

// Ejecutar cuando la página cargue
document.addEventListener('DOMContentLoaded', mostrarCatalogo);
window.addEventListener('load', mostrarCatalogo);
    
    
    // Los botones de compra ya están manejados en initEcommerce()
    
    // Función de prueba para verificar botones
    window.testBotones = function() {
        console.log('=== PRUEBA DE BOTONES ===');
        console.log('Usuario actual:', currentUser);
        console.log('Carrito actual:', carrito);
        console.log('Favoritos actual:', favoritos);
        
        // Probar función de carrito
        console.log('Probando agregar al carrito...');
        agregarAlCarrito('guayabera');
        
        // Probar función de favoritos
        console.log('Probando toggle favorito...');
        toggleFavorito('guayabera');
        
        // Probar función de compra
        console.log('Probando comprar...');
        comprarAhora('guayabera');
    };
    
    // Función de prueba para el modal
    window.testModal = function(tipo = 'guayabera') {
        console.log('=== PRUEBA DE MODAL ===');
        console.log('Probando modal para tipo:', tipo);
        mostrarTodosProductosTipo(tipo);
    };
    
    // Función para verificar botones del carrusel
    window.verificarCarrusel = function() {
        console.log('=== VERIFICACIÓN DE CARRUSEL ===');
        const botonesCarrusel = document.querySelectorAll('.carrusel-ver-mas');
        console.log('Botones del carrusel encontrados:', botonesCarrusel.length);

        botonesCarrusel.forEach((boton, index) => {
            const tipo = boton.getAttribute('data-tipo');
            console.log(`Botón ${index + 1}: tipo="${tipo}", clase="${boton.className}"`);
        });

        const modal = document.getElementById('modal-productos');
        console.log('Modal encontrado:', !!modal);

        const titulo = document.getElementById('modal-titulo');
        console.log('Título del modal encontrado:', !!titulo);

        const body = document.getElementById('modal-body');
        console.log('Body del modal encontrado:', !!body);
    };
    
    // Función de prueba para debuggear el problema
    window.probarVerMas = function(tipo = 'guayabera') {
        console.log('=== PRUEBA VER MÁS ===');
        console.log('Probando con tipo:', tipo);
        mostrarTodosProductosTipo(tipo);
    };
    
    
    
    // Efecto de productos que aparecen al hacer scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Aplicar efecto a cada producto
    document.querySelectorAll('.producto-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Función para mostrar secciones
function mostrarSeccion(seccion) {
    // Si es inicio, mostrar todas las secciones principales
    if (seccion === 'inicio') {
        // Ocultar carrito y favoritos
        document.getElementById('carrito').style.display = 'none';
        document.getElementById('favoritos').style.display = 'none';
        
        // Mostrar secciones principales
        document.getElementById('inicio').style.display = 'block';
        document.getElementById('vision-mision').style.display = 'block';
        document.getElementById('productos').style.display = 'block';
        document.getElementById('contacto').style.display = 'block';
        
        // Scroll al inicio
        document.getElementById('inicio').scrollIntoView({ behavior: 'smooth' });
        
        // Activar filtro "Todos" en productos
        const filtroTodos = document.querySelector('.filtro-btn[data-categoria="todos"]');
        if (filtroTodos) {
            document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
            filtroTodos.classList.add('active');
            
            // Mostrar todos los productos
            document.querySelectorAll('.producto-card').forEach(producto => {
                    producto.style.display = 'block';
                    producto.classList.remove('hidden');
            });
        }
                } else {
        // Para otras secciones, ocultar todas y mostrar solo la seleccionada
        document.querySelectorAll('section').forEach(section => {
            section.style.display = 'none';
        });
        
        // Mostrar sección seleccionada
        const seccionElement = document.getElementById(seccion);
        if (seccionElement) {
            seccionElement.style.display = 'block';
            
            // Scroll a la sección
            seccionElement.scrollIntoView({ behavior: 'smooth' });
            
            // Si es la sección de productos, actualizar filtros
            if (seccion === 'productos') {
                // Activar filtro "Todos" por defecto
                const filtroTodos = document.querySelector('.filtro-btn[data-categoria="todos"]');
                if (filtroTodos) {
                    document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
                    filtroTodos.classList.add('active');
                    
                    // Mostrar todos los productos
                    document.querySelectorAll('.producto-card').forEach(producto => {
                        producto.style.display = 'block';
                        producto.classList.remove('hidden');
                    });
                }
            }
            
            // Si es la sección de carrito, mostrar productos
            if (seccion === 'carrito') {
                // Verificar si hay usuario logueado
                if (!currentUser) {
                    mostrarNotificacion('Debes iniciar sesión para ver tu carrito', 'error');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                    return;
                }
                mostrarCarrito();
            }
            
            // Si es la sección de favoritos, mostrar productos
            if (seccion === 'favoritos') {
                // Verificar si hay usuario logueado
                if (!currentUser) {
                    mostrarNotificacion('Debes iniciar sesión para ver tus favoritos', 'error');
                    setTimeout(() => {
                        window.location.href = 'login.html';
                    }, 1500);
                    return;
                }
                mostrarFavoritos();
            }
        }
    }
}

// Funciones de e-commerce básicas
function initEcommerce() {
    console.log('Inicializando e-commerce...');
    
    // Event listener para formulario de registro
    const formRegistro = document.getElementById('formRegistroCliente');
    if (formRegistro) {
        formRegistro.addEventListener('submit', manejarRegistroCliente);
        console.log('✅ Event listener agregado para formulario de registro');
    } else {
        console.warn('⚠️ No se encontró el formulario de registro');
    }
    
    // Event listeners para botones de carrito y favoritos
    document.addEventListener('click', function(e) {
        console.log('Click detectado en:', e.target);
        console.log('Clases del elemento:', e.target.classList);
        
        if (e.target.classList.contains('btn-carrito')) {
            const productoCard = e.target.closest('.producto-card');
            if (productoCard) {
                const productoId = productoCard.dataset.producto;
                console.log('Botón carrito clickeado, producto ID:', productoId);
                console.log('Usuario actual:', currentUser);
                agregarAlCarrito(productoId);
            } else {
                console.error('No se encontró .producto-card padre');
            }
        }
        
        if (e.target.classList.contains('btn-favorito')) {
            const productoCard = e.target.closest('.producto-card');
            if (productoCard) {
                const productoId = productoCard.dataset.producto;
                console.log('Botón favorito clickeado, producto ID:', productoId);
                toggleFavorito(productoId);
            }
        }
        
        if (e.target.classList.contains('btn-compra')) {
            const productoCard = e.target.closest('.producto-card');
            if (productoCard) {
                const productoId = productoCard.dataset.producto;
                console.log('Botón compra clickeado, producto ID:', productoId);
                comprarAhora(productoId);
            }
        }
        
        
        // Event listener para botones "Ver Detalles" del overlay
        if (e.target.classList.contains('btn-ver')) {
            const productoCard = e.target.closest('.producto-card');
            if (productoCard) {
                const productoId = productoCard.dataset.producto;
                console.log('🔴 Botón Ver Detalles overlay clickeado, producto ID:', productoId);
                mostrarDetallesProducto(productoId);
            }
        }
        
        // Event listener para botones "Ver Más" de productos
        if (e.target.classList.contains('btn-ver-mas-producto')) {
            const tipo = e.target.getAttribute('data-tipo');
            console.log('Botón Ver Más producto clickeado, tipo:', tipo);
            mostrarTodosProductosTipo(tipo);
        }
    });
    
    // Event listeners para navegación
    const navCarrito = document.getElementById('nav-carrito');
    const navFavoritos = document.getElementById('nav-favoritos');
    
    if (navCarrito) {
        navCarrito.addEventListener('click', (e) => {
            e.preventDefault();
            mostrarSeccion('carrito');
        });
    }
    
    if (navFavoritos) {
        navFavoritos.addEventListener('click', (e) => {
            e.preventDefault();
            mostrarSeccion('favoritos');
        });
    }
    
    // Event listener para cerrar modal
    const modalCerrar = document.getElementById('modal-cerrar');
    const modalProductos = document.getElementById('modal-productos');
    
    if (modalCerrar) {
        modalCerrar.addEventListener('click', cerrarModal);
    }
    
    if (modalProductos) {
        modalProductos.addEventListener('click', function(e) {
            if (e.target === this) {
                cerrarModal();
            }
        });
    }
    
    console.log('E-commerce inicializado correctamente');
}

// Función eliminada - se usa la versión más completa más abajo

// Función eliminada - se usa la versión más completa más abajo

// Función eliminada - se usa la versión más completa más abajo

function obtenerDatosProducto(productoId) {
    console.log('Buscando producto con ID:', productoId);
    
    // Buscar en el nuevo sistema de productos
    const producto = productos.find(p => p.id === productoId);
    if (producto) {
        console.log('Producto encontrado:', producto);
        return {
            id: producto.id,
            nombre: producto.nombre,
            precio: `$${producto.precio.toLocaleString()}`,
            imagen: producto.imagen,
            descripcion: producto.descripcion,
            categoria: producto.categoria
        };
    }
    
    // Buscar en el sistema anterior para compatibilidad
    const tipos = ['guayabera', 'buso', 'conjunto', 'cuadro', 'chapa', 'poncho', 'gorra', 'sombrero', 'bolso', 'monedero', 'porta-celular', 'pocillo', 'arete', 'arete-collar', 'iman-nevera', 'monia', 'pulsera'];
    
    for (let tipo of tipos) {
        const productosTipo = obtenerProductosTipo(tipo);
        const encontrado = productosTipo.find(p => p.id === productoId);
        if (encontrado) {
            console.log('Producto encontrado (sistema anterior):', encontrado);
            return encontrado;
        }
    }
    
    // Buscar por tipo (para IDs como 'guayabera', 'buso', etc.)
    const productosTipo = obtenerProductosTipo(productoId);
    if (productosTipo && productosTipo.length > 0) {
        const primerProducto = productosTipo[0];
        console.log('Producto encontrado por tipo:', primerProducto);
        return primerProducto;
    }
    
    // Si no se encuentra, crear un producto genérico para evitar errores
    console.warn('Producto no encontrado, creando producto genérico:', productoId);
    return {
        id: productoId,
        nombre: `Producto ${productoId}`,
        precio: '$0',
        imagen: 'images/Logo/logo-pincelart.jpg',
        descripcion: 'Producto no encontrado',
        categoria: 'desconocida'
    };
}

function actualizarCarrito() {
    const carritoCount = document.getElementById('carrito-count');
    if (carritoCount) {
        carritoCount.textContent = carrito.length;
    }
}

function actualizarFavoritos() {
    const favoritosCount = document.getElementById('favoritos-count');
    if (favoritosCount) {
        favoritosCount.textContent = favoritos.length;
    }
}

function actualizarContadores() {
    actualizarCarrito();
    actualizarFavoritos();
}

function actualizarBotonFavorito(productoId) {
    // Actualizar botones en la página principal
    const botones = document.querySelectorAll(`[data-producto="${productoId}"] .btn-favorito`);
    const esFavorito = favoritos.some(item => item.id === productoId);
    
    botones.forEach(boton => {
        if (boton) {
            boton.classList.toggle('favorito-activo', esFavorito);
            // Cambiar el texto del botón para indicar el estado
            if (esFavorito) {
                boton.innerHTML = '❤️ En Favoritos';
            } else {
                boton.innerHTML = '❤️ Favorito';
            }
        }
    });
    
    console.log(`Botón favorito actualizado para ${productoId}: ${esFavorito ? 'ACTIVO' : 'INACTIVO'}`);
}

function mostrarNotificacion(mensaje, tipo = 'info') {
    // Crear contenedor de notificaciones si no existe
    let notificacionContainer = document.getElementById('notificacion-container');
    if (!notificacionContainer) {
        notificacionContainer = document.createElement('div');
        notificacionContainer.id = 'notificacion-container';
        notificacionContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(notificacionContainer);
    }
    
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.textContent = mensaje;
    notificacion.style.cssText = `
        background: ${tipo === 'error' ? '#f44336' : tipo === 'success' ? '#4caf50' : '#2196f3'};
        color: white;
        padding: 12px 20px;
        border-radius: 4px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        font-size: 14px;
        font-weight: 500;
        max-width: 300px;
        word-wrap: break-word;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;
    
    notificacionContainer.appendChild(notificacion);
    
    // Animar entrada
    setTimeout(() => {
        notificacion.style.opacity = '1';
        notificacion.style.transform = 'translateX(0)';
    }, 10);
    
    // Remover después de 3 segundos
    setTimeout(() => {
        notificacion.style.opacity = '0';
        notificacion.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notificacion.parentNode) {
                notificacion.parentNode.removeChild(notificacion);
            }
        }, 300);
    }, 3000);
}

// Funciones para el modal "Ver Más"
function mostrarTodosProductosTipo(tipo) {
    console.log('=== MOSTRAR TODOS PRODUCTOS TIPO ===');
    console.log('Tipo recibido:', tipo);
    console.log('Tipo de dato:', typeof tipo);
    
    const productos = obtenerProductosTipo(tipo);
    console.log('Productos encontrados:', productos.length);
    console.log('Productos:', productos);
    
    const modal = document.getElementById('modal-productos');
    const titulo = document.getElementById('modal-titulo');
    const body = document.getElementById('modal-body');
    
    if (!modal || !titulo || !body) {
        console.error('Elementos del modal no encontrados');
        return;
    }
    
    if (productos.length === 0) {
        console.error('No se encontraron productos para el tipo:', tipo);
        titulo.textContent = `No hay productos disponibles`;
        body.innerHTML = '<p>No se encontraron productos de este tipo.</p>';
        modal.style.display = 'flex';
        return;
    }
    
    // Obtener el nombre base del producto
    const nombreBase = productos[0]?.nombre || tipo;
    const cantidad = productos.length;
    
    titulo.textContent = `Ver Más ${nombreBase} (${cantidad} productos)`;
    console.log('Título del modal establecido a:', titulo.textContent);
    
    body.innerHTML = '';
    console.log('Body del modal limpiado, procesando', productos.length, 'productos');
    
    productos.forEach((producto, index) => {
        console.log(`Procesando producto ${index + 1}:`, producto.nombre);
        const productoDiv = document.createElement('div');
        productoDiv.className = 'producto-card-modal';
        productoDiv.setAttribute('data-categoria', producto.categoria.toLowerCase());
        productoDiv.setAttribute('data-producto', producto.id);
        productoDiv.innerHTML = `
            <div class="producto-img">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-producto">
                <div class="overlay">
                    <button class="btn-ver">Ver Detalles</button>
                </div>
            </div>
            <h3>${producto.nombre}</h3>
            <p>${producto.descripcion}</p>
            <div class="precio-categoria">
                <span class="precio">$${producto.precio ? (typeof producto.precio === 'number' ? producto.precio.toLocaleString() : producto.precio) : 'Consultar'}</span>
                <span class="categoria">${producto.categoria}</span>
            </div>
            <small style="display: block; margin-top: 0.5rem; color: #4caf50; font-weight: 600;">
                Stock: 1
            </small>
            <div class="producto-acciones">
                <button class="btn-carrito" data-producto="${producto.id}">🛒 Carrito</button>
                <button class="btn-compra" data-producto="${producto.id}">💳 Comprar</button>
                <button class="btn-favorito" data-producto="${producto.id}">❤️ Favorito</button>
            </div>
        `;
        body.appendChild(productoDiv);
    });
    
    // Agregar event listeners a los botones del modal
    agregarEventListenersModal();
    
    console.log('Mostrando modal con', productos.length, 'productos');
    console.log('Modal mostrado, título final:', titulo.textContent);
    console.log('Contenido del body:', body.innerHTML.substring(0, 200) + '...');
    modal.style.display = 'flex';
}

function cerrarModal() {
    const modal = document.getElementById('modal-productos');
    if (modal) {
        modal.style.display = 'none';
        console.log('Modal cerrado');
    }
}

// Función para mostrar detalles del producto
function mostrarDetallesProducto(productoId) {
    console.log('Mostrando detalles para producto:', productoId);
    
    // Buscar el producto en todos los tipos
    let producto = null;
    const tipos = ['guayabera', 'buso', 'conjunto', 'cuadro', 'chapa', 'poncho', 'gorra', 'sombrero', 'bolso', 'monedero', 'porta-celular', 'pocillo', 'arete', 'arete-collar', 'iman-nevera', 'monia', 'pulsera'];
    
    for (let tipo of tipos) {
        const productos = obtenerProductosTipo(tipo);
        const encontrado = productos.find(p => p.id === productoId);
        if (encontrado) {
            producto = encontrado;
            break;
        }
    }
    
    if (!producto) {
        console.error('Producto no encontrado:', productoId);
        mostrarNotificacion('Producto no encontrado', 'error');
        return;
    }
    
    // Crear modal de detalles si no existe
    let modalDetalles = document.getElementById('modal-detalles');
    if (!modalDetalles) {
        modalDetalles = document.createElement('div');
        modalDetalles.id = 'modal-detalles';
        modalDetalles.className = 'modal-productos';
        modalDetalles.innerHTML = `
            <div class="modal-contenido modal-detalles-contenido">
                <div class="modal-header">
                    <h3 id="modal-detalles-titulo">Detalles del Producto</h3>
                    <button class="modal-cerrar" id="modal-detalles-cerrar">&times;</button>
                </div>
                <div class="modal-body" id="modal-detalles-body">
                    <!-- Contenido dinámico -->
                </div>
            </div>
        `;
        document.body.appendChild(modalDetalles);
        
        // Event listener para cerrar modal
        document.getElementById('modal-detalles-cerrar').addEventListener('click', () => {
            modalDetalles.style.display = 'none';
        });
        
        // Event listener para cerrar al hacer clic fuera del modal
        modalDetalles.addEventListener('click', (e) => {
            if (e.target === modalDetalles) {
                modalDetalles.style.display = 'none';
            }
        });
    }
    
    // Llenar el modal con los detalles del producto
    const titulo = document.getElementById('modal-detalles-titulo');
    const body = document.getElementById('modal-detalles-body');
    
    titulo.textContent = producto.nombre;
    
    body.innerHTML = `
        <div class="detalles-producto">
            <div class="detalles-imagen">
                <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-detalle">
            </div>
            <div class="detalles-info">
                <h2>${producto.nombre}</h2>
                <div class="detalles-categoria">
                    <span class="categoria-badge">${producto.categoria}</span>
                </div>
                <div class="detalles-precio">
                    <span class="precio-detalle">${producto.precio}</span>
                </div>
                <div class="detalles-descripcion">
                    <h3>Descripción</h3>
                    <p>${producto.descripcion}</p>
                </div>
                <div class="detalles-caracteristicas">
                    <h3>Características</h3>
                    <ul>
                        <li>✅ Diseño artesanal amazónico</li>
                        <li>✅ Materiales de alta calidad</li>
                        <li>✅ Confección única y personalizada</li>
                        <li>✅ Perfecto para ocasiones especiales</li>
                        <li>✅ Envío a toda Colombia</li>
                    </ul>
                </div>
                <div class="detalles-acciones">
                    <button class="btn-carrito btn-detalle" data-producto="${producto.id}">🛒 Agregar al Carrito</button>
                    <button class="btn-compra btn-detalle" data-producto="${producto.id}">💳 Comprar Ahora</button>
                    <button class="btn-favorito btn-detalle" data-producto="${producto.id}">❤️ Agregar a Favoritos</button>
                </div>
            </div>
        </div>
    `;
    
    // Agregar event listeners a los botones del modal de detalles
    agregarEventListenersDetalles();
    
    // Mostrar el modal
    modalDetalles.style.display = 'flex';
    console.log('Modal de detalles mostrado para:', producto.nombre);
}

// Función para agregar event listeners a los botones del modal de detalles
function agregarEventListenersDetalles() {
    const modal = document.getElementById('modal-detalles');
    if (!modal) return;
    
    modal.addEventListener('click', function(e) {
        if (e.target.classList.contains('btn-carrito')) {
            const productoId = e.target.dataset.producto;
            console.log('Botón carrito detalles clickeado, producto ID:', productoId);
            agregarAlCarrito(productoId);
        }
        
        if (e.target.classList.contains('btn-favorito')) {
            const productoId = e.target.dataset.producto;
            console.log('Botón favorito detalles clickeado, producto ID:', productoId);
            toggleFavorito(productoId);
        }
        
        if (e.target.classList.contains('btn-compra')) {
            const productoId = e.target.dataset.producto;
            console.log('Botón compra detalles clickeado, producto ID:', productoId);
            comprarAhora(productoId);
        }
    });
}

// Función para agregar event listeners a los botones del modal
function agregarEventListenersModal() {
    const modal = document.getElementById('modal-productos');
    if (!modal) return;
    
    // Event listener para botones dentro del modal
    modal.addEventListener('click', function(e) {
        console.log('Click en modal:', e.target);
        
        if (e.target.classList.contains('btn-carrito')) {
            const productoCard = e.target.closest('.producto-card-modal');
            if (productoCard) {
                const productoId = productoCard.dataset.producto;
                console.log('Botón carrito modal clickeado, producto ID:', productoId);
                agregarAlCarrito(productoId);
            }
        }
        
        if (e.target.classList.contains('btn-favorito')) {
            const productoCard = e.target.closest('.producto-card-modal');
            if (productoCard) {
                const productoId = productoCard.dataset.producto;
                console.log('Botón favorito modal clickeado, producto ID:', productoId);
                toggleFavorito(productoId);
            }
        }
        
        if (e.target.classList.contains('btn-compra')) {
            const productoCard = e.target.closest('.producto-card-modal');
            if (productoCard) {
                const productoId = productoCard.dataset.producto;
                console.log('Botón compra modal clickeado, producto ID:', productoId);
                comprarAhora(productoId);
            }
        }
        
        if (e.target.classList.contains('btn-ver')) {
            const productoCard = e.target.closest('.producto-card-modal');
            if (productoCard) {
                const productoId = productoCard.dataset.producto;
                console.log('🔴 Botón Ver Detalles modal clickeado, producto ID:', productoId);
                mostrarDetallesProducto(productoId);
            }
        }
    });
}

function obtenerProductosTipo(tipo) {
    console.log('=== OBTENER PRODUCTOS TIPO ===');
    console.log('Tipo solicitado:', tipo);
    
    // CARGAR PRODUCTOS DESDE LOCALSTORAGE (GESTIÓN DE PRODUCTOS)
    const productosGestion = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
    
    if (productosGestion.length > 0) {
        console.log(`✅ Usando ${productosGestion.length} productos de Gestión de Productos`);
        
        // FILTRAR: Solo productos ACTIVOS para modales "Ver Más"
        const productosActivos = productosGestion.filter(p => 
            p.estado === 'activo' || p.estado === 'disponible'
        );
        
        console.log(`👥 Filtrando a ${productosActivos.length} productos ACTIVOS de ${productosGestion.length} totales`);
        
        return productosActivos.filter(p => {
            const imagenMatch = p.imagen && p.imagen.toLowerCase().includes(tipo.toLowerCase());
            const nombreMatch = p.nombre && p.nombre.toLowerCase().includes(tipo.toLowerCase());
            return imagenMatch || nombreMatch;
        });
    }
    
    // Si no hay productos en gestión, usar datos estáticos como fallback
    console.log('⚠️ No hay productos en gestión, usando datos estáticos');
    const productos = {
        'guayabera': [
            { id: 'guayabera', nombre: 'Guayabera para Mujer', precio: '$65.000', imagen: 'images/productos/Ropa/Guayabera/guayaberaFem1.jpg', descripcion: 'Elegancia y tradición amazónica en cada puntada. Diseño clásico con bordados únicos que reflejan la cultura amazónica. Perfecta para ocasiones especiales y eventos tradicionales.', categoria: 'Ropa' },
            { id: 'guayabera2', nombre: 'Guayabera para Mujer', precio: '$65.000', imagen: 'images/productos/Ropa/Guayabera/guayaberaFem2.jpg', descripcion: 'Diseño tradicional amazónico con detalles únicos. Confeccionada con materiales de alta calidad y técnicas artesanales ancestrales. Ideal para mujeres que valoran la autenticidad cultural.', categoria: 'Ropa' },
            { id: 'guayabera3', nombre: 'Guayabera para Mujer', precio: '$65.000', imagen: 'images/productos/Ropa/Guayabera/guayaberaFem3.jpg', descripcion: 'Estilo contemporáneo con esencia amazónica. Combina la elegancia moderna con elementos tradicionales. Diseño versátil que se adapta tanto a eventos formales como casuales.', categoria: 'Ropa' },
            { id: 'guayabera4', nombre: 'Guayabera para Mujer', precio: '$65.000', imagen: 'images/productos/Ropa/Guayabera/guayaberaFem4.jpg', descripcion: 'Perfecta para ocasiones especiales. Diseño sofisticado con bordados artesanales que cuentan historias de la Amazonía. Confección única que realza la feminidad y elegancia.', categoria: 'Ropa' },
            { id: 'guayabera5', nombre: 'Guayabera para Mujer', precio: '$65.000', imagen: 'images/productos/Ropa/Guayabera/guayaberaFem5.jpg', descripcion: 'Comodidad y elegancia para el día a día. Diseño práctico sin perder el toque cultural amazónico. Ideal para mujeres activas que buscan estilo y comodidad en su vestuario diario.', categoria: 'Ropa' },
            { id: 'guayabera6', nombre: 'Guayabera para Hombre', precio: '$70.000', imagen: 'images/productos/Ropa/Guayabera/guayaberaMas1.jpg', descripcion: 'Diseño clásico masculino con toque amazónico. Confeccionada con la tradición y elegancia que caracteriza a las guayaberas. Perfecta para hombres que buscan distinción y comodidad.', categoria: 'Ropa' }
        ],
        'buso': [
            { id: 'buso', nombre: 'Busos', precio: '$35.000', imagen: 'images/productos/Ropa/BusosHombre/busoMas1.jpg', descripcion: 'Comodidad y estilo con diseños únicos', categoria: 'Ropa' },
            { id: 'buso2', nombre: 'Buso Deportivo', precio: '$35.000', imagen: 'images/productos/Ropa/BusosHombre/busoMas2.jpg', descripcion: 'Perfecto para actividades físicas', categoria: 'Ropa' },
            { id: 'buso3', nombre: 'Buso Casual', precio: '$35.000', imagen: 'images/productos/Ropa/BusosHombre/busoMas3.jpg', descripcion: 'Ideal para el día a día', categoria: 'Ropa' },
            { id: 'buso4', nombre: 'Buso Clásico', precio: '$35.000', imagen: 'images/productos/Ropa/BusosHombre/busoMas4.jpg', descripcion: 'Diseño tradicional amazónico', categoria: 'Ropa' },
            { id: 'buso5', nombre: 'Buso Moderno', precio: '$35.000', imagen: 'images/productos/Ropa/BusosHombre/busoMas5.jpg', descripcion: 'Estilo contemporáneo', categoria: 'Ropa' }
        ],
        'conjunto': [
            { id: 'conjunto', nombre: 'Conjunto Amazónico', precio: '$120.000', imagen: 'images/productos/Ropa/ConjuntoAmazonico/conjuntoAmazonicoFem1.jpg', descripcion: 'Set completo tradicional', categoria: 'Ropa' },
            { id: 'conjunto2', nombre: 'Conjunto Tradicional', precio: '$120.000', imagen: 'images/productos/Ropa/ConjuntoAmazonico/conjuntoAmazonicoFem2.jpg', descripcion: 'Autenticidad amazónica', categoria: 'Ropa' }
        ],
        'cuadro': [
            { id: 'cuadro', nombre: 'Cuadros', precio: '$75.000', imagen: 'images/productos/hogar/Cuadros/cuadro1.jpg', descripcion: 'Arte amazónico para tu hogar', categoria: 'Hogar' },
            { id: 'cuadro2', nombre: 'Cuadro Paisaje', precio: '$75.000', imagen: 'images/productos/hogar/Cuadros/cuadro2.jpg', descripcion: 'Paisajes amazónicos únicos', categoria: 'Hogar' },
            { id: 'cuadro3', nombre: 'Cuadro Cultural', precio: '$75.000', imagen: 'images/productos/hogar/Cuadros/cuadro3.jpg', descripcion: 'Cultura amazónica en cada obra', categoria: 'Hogar' },
            { id: 'cuadro4', nombre: 'Cuadro Artístico', precio: '$75.000', imagen: 'images/productos/hogar/Cuadros/cuadro4.jpg', descripcion: 'Arte tradicional amazónico', categoria: 'Hogar' }
        ],
        'chapa': [
            { id: 'chapa', nombre: 'Chapas', precio: '$45.000', imagen: 'images/productos/accesorios/Chapas/chapa1.jpg', descripcion: 'Diseño único personalizado', categoria: 'Accesorios' },
            { id: 'chapa2', nombre: 'Chapa Personalizada', precio: '$45.000', imagen: 'images/productos/accesorios/Chapas/chapa2.jpg', descripcion: 'Con tu nombre o logo', categoria: 'Accesorios' },
            { id: 'chapa3', nombre: 'Chapa Amazónica', precio: '$45.000', imagen: 'images/productos/accesorios/Chapas/chapa3.jpg', descripcion: 'Diseños auténticos', categoria: 'Accesorios' }
        ],
        'poncho': [
            { id: 'poncho', nombre: 'Ponchos', precio: '$85.000', imagen: 'images/productos/accesorios/Ponchos/poncho1.jpg', descripcion: 'Abrigo tradicional amazónico', categoria: 'Accesorios' },
            { id: 'poncho2', nombre: 'Poncho Artesanal', precio: '$85.000', imagen: 'images/productos/accesorios/Ponchos/poncho2.jpg', descripcion: 'Hecho a mano con materiales naturales', categoria: 'Accesorios' },
            { id: 'poncho3', nombre: 'Poncho Clásico', precio: '$85.000', imagen: 'images/productos/accesorios/Ponchos/poncho3.jpg', descripcion: 'Diseño tradicional', categoria: 'Accesorios' }
        ],
        'gorra': [
            { id: 'gorra', nombre: 'Gorras', precio: '$25.000', imagen: 'images/productos/accesorios/Gorras/gorra1.jpg', descripcion: 'Estilo y protección', categoria: 'Accesorios' },
            { id: 'gorra2', nombre: 'Gorra Deportiva', precio: '$25.000', imagen: 'images/productos/accesorios/Gorras/gorra2.jpg', descripcion: 'Perfecta para actividades al aire libre', categoria: 'Accesorios' },
            { id: 'gorra3', nombre: 'Gorra Casual', precio: '$25.000', imagen: 'images/productos/accesorios/Gorras/gorra3.jpg', descripcion: 'Para el día a día', categoria: 'Accesorios' },
            { id: 'gorra4', nombre: 'Gorra Amazónica', precio: '$25.000', imagen: 'images/productos/accesorios/Gorras/gorra4.jpg', descripcion: 'Diseños únicos amazónicos', categoria: 'Accesorios' },
            { id: 'gorra5', nombre: 'Gorra Artesanal', precio: '$25.000', imagen: 'images/productos/accesorios/Gorras/gorra5.jpg', descripcion: 'Hecha a mano', categoria: 'Accesorios' },
            { id: 'gorra6', nombre: 'Gorra Personalizada', precio: '$25.000', imagen: 'images/productos/accesorios/Gorras/gorra6.jpg', descripcion: 'Con tu diseño especial', categoria: 'Accesorios' }
        ],
        'sombrero': [
            { id: 'sombrero', nombre: 'Sombreros', precio: '$40.000', imagen: 'images/productos/accesorios/Sombreros/sombrero1.jpg', descripcion: 'Protección del sol con elegancia', categoria: 'Accesorios' },
            { id: 'sombrero2', nombre: 'Sombrero de Paja', precio: '$40.000', imagen: 'images/productos/accesorios/Sombreros/sombrero2.jpg', descripcion: 'Materiales naturales amazónicos', categoria: 'Accesorios' },
            { id: 'sombrero3', nombre: 'Sombrero Artesanal', precio: '$40.000', imagen: 'images/productos/accesorios/Sombreros/sombrero3.jpg', descripcion: 'Hecho a mano', categoria: 'Accesorios' }
        ],
        'bolso': [
            { id: 'bolso', nombre: 'Bolsos', precio: '$35.000', imagen: 'images/productos/accesorios/Bolsos/bolso1.jpg', descripcion: 'Prácticos y resistentes', categoria: 'Accesorios' },
            { id: 'bolso2', nombre: 'Bolso Artesanal', precio: '$35.000', imagen: 'images/productos/accesorios/Bolsos/bolso2.jpg', descripcion: 'Diseños únicos amazónicos', categoria: 'Accesorios' },
            { id: 'bolso3', nombre: 'Bolso Tradicional', precio: '$35.000', imagen: 'images/productos/accesorios/Bolsos/bolso3.jpg', descripcion: 'Estilo clásico', categoria: 'Accesorios' }
        ],
        'monedero': [
            { id: 'monedero', nombre: 'Monederos', precio: '$15.000', imagen: 'images/productos/accesorios/Monederos/monedero1.jpg', descripcion: 'Elegancia artesanal', categoria: 'Accesorios' },
            { id: 'monedero2', nombre: 'Monedero Tradicional', precio: '$15.000', imagen: 'images/productos/accesorios/Monederos/monedero2.jpg', descripcion: 'Diseños únicos de la Amazonía', categoria: 'Accesorios' },
            { id: 'monedero3', nombre: 'Monedero Artesanal', precio: '$15.000', imagen: 'images/productos/accesorios/Monederos/monedero3.jpg', descripcion: 'Hecho a mano', categoria: 'Accesorios' }
        ],
        'porta-celular': [
            { id: 'porta-celular', nombre: 'Porta Celular', precio: '$12.000', imagen: 'images/productos/accesorios/PortaCelulares/portaCelular1.jpg', descripcion: 'Protege tu dispositivo con estilo', categoria: 'Accesorios' },
            { id: 'porta-celular2', nombre: 'Porta Celular Amazónico', precio: '$12.000', imagen: 'images/productos/accesorios/PortaCelulares/portaCelular2.jpg', descripcion: 'Diseño amazónico clásico', categoria: 'Accesorios' },
            { id: 'porta-celular3', nombre: 'Porta Celular Personalizado', precio: '$12.000', imagen: 'images/productos/accesorios/PortaCelulares/portaCelular3.jpg', descripcion: 'Con tu diseño especial', categoria: 'Accesorios' },
            { id: 'porta-celular4', nombre: 'Porta Celular Artesanal', precio: '$12.000', imagen: 'images/productos/accesorios/PortaCelulares/portaCelular4.jpg', descripcion: 'Hecho a mano con técnicas tradicionales', categoria: 'Accesorios' },
            { id: 'porta-celular5', nombre: 'Porta Celular Elegante', precio: '$12.000', imagen: 'images/productos/accesorios/PortaCelulares/portaCelular5.jpg', descripcion: 'Para ocasiones especiales', categoria: 'Accesorios' },
            { id: 'porta-celular6', nombre: 'Porta Celular Único', precio: '$12.000', imagen: 'images/productos/accesorios/PortaCelulares/portaCelular6.jpg', descripcion: 'Diseño exclusivo amazónico', categoria: 'Accesorios' }
        ],
        'pocillo': [
            { id: 'pocillo', nombre: 'Pocillos', precio: '$25.000', imagen: 'images/productos/hogar/Pocillos/pocillo1.jpg', descripcion: 'Para tu café mañanero', categoria: 'Hogar' },
            { id: 'pocillo2', nombre: 'Pocillo Personalizado', precio: '$25.000', imagen: 'images/productos/hogar/Pocillos/pocillo2.jpg', descripcion: 'Con diseños amazónicos únicos', categoria: 'Hogar' },
            { id: 'pocillo3', nombre: 'Pocillo Artesanal', precio: '$25.000', imagen: 'images/productos/hogar/Pocillos/pocillo3.jpg', descripcion: 'Hecho a mano', categoria: 'Hogar' },
            { id: 'pocillo4', nombre: 'Pocillo Tradicional', precio: '$25.000', imagen: 'images/productos/hogar/Pocillos/pocillo4.jpg', descripcion: 'Diseño clásico amazónico', categoria: 'Hogar' }
        ],
        'arete': [
            { id: 'arete', nombre: 'Aretes', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete1.jpg', descripcion: 'Elegancia artesanal', categoria: 'Accesorios' },
            { id: 'arete2', nombre: 'Aretes Tradicionales', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete2.jpg', descripcion: 'Diseños únicos amazónicos', categoria: 'Accesorios' },
            { id: 'arete3', nombre: 'Aretes Artesanales', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete3.jpg', descripcion: 'Hechos a mano', categoria: 'Accesorios' },
            { id: 'arete4', nombre: 'Aretes Elegantes', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete4.jpg', descripcion: 'Para ocasiones especiales', categoria: 'Accesorios' },
            { id: 'arete5', nombre: 'Aretes Modernos', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete5.jpg', descripcion: 'Estilo contemporáneo', categoria: 'Accesorios' },
            { id: 'arete6', nombre: 'Aretes Clásicos', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete6.jpg', descripcion: 'Diseño tradicional', categoria: 'Accesorios' },
            { id: 'arete7', nombre: 'Aretes Personalizados', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete7.jpg', descripcion: 'Con tu diseño especial', categoria: 'Accesorios' },
            { id: 'arete8', nombre: 'Aretes Únicos', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete8.jpg', descripcion: 'Diseños exclusivos', categoria: 'Accesorios' },
            { id: 'arete9', nombre: 'Aretes Amazónicos', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete9.jpg', descripcion: 'Esencia amazónica', categoria: 'Accesorios' },
            { id: 'arete10', nombre: 'Aretes Premium', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete10.jpg', descripcion: 'Calidad superior', categoria: 'Accesorios' },
            { id: 'arete11', nombre: 'Aretes 11', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete11.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete12', nombre: 'Aretes 12', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete12.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete13', nombre: 'Aretes 13', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete13.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete14', nombre: 'Aretes 14', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete14.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete15', nombre: 'Aretes 15', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete15.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete16', nombre: 'Aretes 16', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete16.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete17', nombre: 'Aretes 17', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete17.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete18', nombre: 'Aretes 18', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete18.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete19', nombre: 'Aretes 19', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete19.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete20', nombre: 'Aretes 20', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete20.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete21', nombre: 'Aretes 21', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete21.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete22', nombre: 'Aretes 22', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete22.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete23', nombre: 'Aretes 23', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete23.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete24', nombre: 'Aretes 24', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete24.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete25', nombre: 'Aretes 25', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete25.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete26', nombre: 'Aretes 26', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete26.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete27', nombre: 'Aretes 27', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete27.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete28', nombre: 'Aretes 28', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete28.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete29', nombre: 'Aretes 29', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete29.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete30', nombre: 'Aretes 30', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete30.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete31', nombre: 'Aretes 31', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete31.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete32', nombre: 'Aretes 32', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete32.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete33', nombre: 'Aretes 33', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete33.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete34', nombre: 'Aretes 34', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete34.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete35', nombre: 'Aretes 35', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete35.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete36', nombre: 'Aretes 36', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete36.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete37', nombre: 'Aretes 37', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete37.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' },
            { id: 'arete38', nombre: 'Aretes 38', precio: '$20.000', imagen: 'images/productos/accesorios/Aretes/arete38.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' }
        ],
        'arete-collar': [
            { id: 'arete-collar', nombre: 'Arete Collar', precio: '$25.000', imagen: 'images/productos/accesorios/AreteCollar/areteCollar1.jpg', descripcion: 'Conjunto elegante', categoria: 'Accesorios' },
            { id: 'arete-collar2', nombre: 'Arete Collar 2', precio: '$25.000', imagen: 'images/productos/accesorios/AreteCollar/areteCollar2.jpg', descripcion: 'Perfecto para ocasiones especiales', categoria: 'Accesorios' },
            { id: 'arete-collar3', nombre: 'Arete Collar 3', precio: '$25.000', imagen: 'images/productos/accesorios/AreteCollar/areteCollar3.jpg', descripcion: 'Hecho a mano', categoria: 'Accesorios' },
            { id: 'arete-collar4', nombre: 'Arete Collar 4', precio: '$25.000', imagen: 'images/productos/accesorios/AreteCollar/areteCollar4.jpg', descripcion: 'Diseño exclusivo', categoria: 'Accesorios' }
        ],
        'iman-nevera': [
            { id: 'iman-nevera', nombre: 'Imán Nevera', precio: '$5.000', imagen: 'images/productos/accesorios/ImanNevera/imanNevera1.jpg', descripcion: 'Decora tu cocina', categoria: 'Accesorios' },
            { id: 'iman-nevera2', nombre: 'Imanes Personalizados', precio: '$5.000', imagen: 'images/productos/accesorios/ImanNevera/imanNevera2.jpg', descripcion: 'Con diseños amazónicos únicos', categoria: 'Accesorios' },
            { id: 'iman-nevera3', nombre: 'Imanes Artesanales', precio: '$5.000', imagen: 'images/productos/accesorios/ImanNevera/imanNevera3.jpg', descripcion: 'Hechos a mano', categoria: 'Accesorios' }
        ],
        'monia': [
            { id: 'monia', nombre: 'Moñas', precio: '$25.000', imagen: 'images/productos/accesorios/Monias/monia1.jpg', descripcion: 'Accesorios tradicionales', categoria: 'Accesorios' },
            { id: 'monia2', nombre: 'Moñas Artesanales', precio: '$25.000', imagen: 'images/productos/accesorios/Monias/monia2.jpg', descripcion: 'Diseños auténticos amazónicos', categoria: 'Accesorios' }
        ],
        'pulsera': [
            { id: 'pulsera', nombre: 'Pulseras', precio: 'Consultar', imagen: 'images/productos/accesorios/Pulsera/pulsera1.jpg', descripcion: 'Elegancia en tu muñeca con diseños únicos amazónicos. Artesanía auténtica.', categoria: 'Accesorios' }
        ]
    };
    
    const resultado = productos[tipo] || [];
    console.log('Resultado obtenido:', resultado);
    console.log('Claves disponibles:', Object.keys(productos));
    console.log('¿Existe el tipo?', tipo in productos);
    
    
    return resultado;
}

// Filtros de categorías DINÁMICOS
function initFiltrosCategorias() {
    // Actualizar filtros dinámicamente desde localStorage
    if (!productos || productos.length === 0) {
        console.log('⚠️ No hay productos para crear filtros');
        return;
    }
    
    // Obtener categorías únicas
    const categorias = [...new Set(productos.map(p => p.categoria))];
    const filtrosContainer = document.querySelector('.filtros-categorias');
    
    if (!filtrosContainer) {
        console.error('❌ No se encontró contenedor de filtros');
        return;
    }
    
    // Limpiar y crear filtros dinámicos
    let filtrosHTML = `<button class="filtro-btn active" data-categoria="todos">Todos</button>`;
    
    categorias.forEach(categoria => {
        const cantidad = productos.filter(p => p.categoria === categoria).length;
        filtrosHTML += `<button class="filtro-btn" data-categoria="${categoria.toLowerCase()}">${categoria} (${cantidad})</button>`;
    });
    
    filtrosContainer.innerHTML = filtrosHTML;
    console.log('✅ Filtros dinámicos creados:', categorias);
    
    // Agregar event listeners
    const filtros = document.querySelectorAll('.filtro-btn');
    filtros.forEach(filtro => {
        filtro.addEventListener('click', () => {
            // Remover clase active de todos los filtros
            filtros.forEach(f => f.classList.remove('active'));
            // Agregar clase active al filtro clickeado
            filtro.classList.add('active');
            
            const categoria = filtro.getAttribute('data-categoria');
            console.log('🔍 Filtrando por:', categoria);
            
            filtrarPorCategoria(categoria);
        });
    });
}

// Función para filtrar productos por categoría
function filtrarPorCategoria(categoria) {
    console.log('🔍 Filtrando catálogo por:', categoria);
    
    const tarjetas = document.querySelectorAll('.producto-card');
    
    if (categoria === 'todos') {
        tarjetas.forEach(tarjeta => {
            tarjeta.style.display = 'block';
            tarjeta.classList.remove('hidden');
        });
        console.log('✅ Mostrando todos los productos (', tarjetas.length, 'tarjetas)');
    } else {
        // Primero ocultar todas
        tarjetas.forEach(tarjeta => {
            tarjeta.style.display = 'none';
            tarjeta.classList.add('hidden');
        });
        
        // Mostrar solo las de la categoría seleccionada
        let visibles = 0;
        tarjetas.forEach(tarjeta => {
            const dataCategoria = tarjeta.getAttribute('data-categoria');
            if (dataCategoria && dataCategoria.toLowerCase() === categoria.toLowerCase()) {
                tarjeta.style.display = 'block';
                tarjeta.classList.remove('hidden');
                visibles++;
            }
        });
        
        console.log(`✅ Mostrando ${visibles} productos de categoría "${categoria}"`);
        
        // Si no hay productos en el HTML estático, verificar localStorage
        if (visibles === 0) {
            console.log('⚠️ No hay tarjetas estáticas para esta categoría en el HTML');
            console.log('💡 Los productos están en localStorage pero no hay tarjetas HTML para ellos');
        }
    }
}


// Función para abreviar nombres largos
function abbreviateName(fullName) {
    if (!fullName) {
        return fullName;
    }
    
    const nameParts = fullName.trim().split(' ');
    
    if (nameParts.length === 1) {
        // Si es un solo nombre, lo mostramos completo
        return fullName;
    }
    
    if (nameParts.length === 2) {
        // Si son dos partes, mostramos ambas (nombre apellido)
        return fullName;
    }
    
    if (nameParts.length >= 3) {
        // Si son tres o más partes, tomamos el primer nombre y el primer apellido
        const firstName = nameParts[0];
        // El primer apellido es el penúltimo elemento (asumiendo que el último es segundo apellido)
        const lastName = nameParts[nameParts.length - 2];
        return `${firstName} ${lastName}`;
    }
    
    return fullName;
}

// Funciones de gestión de usuarios
function checkUserSession() {
    currentUser = JSON.parse(localStorage.getItem('pincelart_current_user'));
    
    // Crear usuario administrador por defecto si no existe
    crearUsuarioAdminPorDefecto();
    
    // Si no hay usuario logueado, mostrar página principal sin restricciones
    if (!currentUser) {
        console.log('Usuario no logueado - mostrando página principal');
        // Cargar datos por defecto
        carrito = [];
        favoritos = [];
        updateUserInterface();
        return;
    }
    
    // Si hay usuario logueado, cargar sus datos
    console.log('Usuario logueado:', currentUser.name);
    carrito = currentUser.carrito || [];
    favoritos = currentUser.favoritos || [];
    
    // Actualizar interfaz de usuario
    updateUserInterface();
}

function crearUsuarioAdminPorDefecto() {
    const users = JSON.parse(localStorage.getItem('pincelart_users')) || [];
    
    // Verificar si ya existe un super usuario
    const superUserExists = users.some(user => user.rol === 'super_usuario');
    
    if (!superUserExists) {
        const superUser = {
            id: 'super_user_001',
            name: 'Ivan Dario Carvajal Reina',
            email: 'pivancarvajal@gmail.com',
            phone: '3000000000',
            password: 'super123',
            rol: 'super_usuario',
            activo: true,
            permisos: ['*'], // Todos los permisos
            creadoPor: 'system',
            createdAt: new Date().toISOString(),
            carrito: [],
            favoritos: []
        };
        
        users.push(superUser);
        localStorage.setItem('pincelart_users', JSON.stringify(users));
        console.log('Super Usuario (Ivan Dario) creado por defecto');
    }
    
    // Crear usuario vendedor de ejemplo si no existe
    const vendedorExists = users.some(user => user.rol === 'vendedor');
    
    if (!vendedorExists) {
        const vendedorUser = {
            id: 'vendedor_001',
            name: 'Vendedor Ejemplo',
            email: 'vendedor@pincelart.com',
            phone: '3001234567',
            password: 'vendedor123',
            rol: 'vendedor',
            activo: true,
            permisos: ['gestion_mis_productos', 'ver_mis_ventas', 'ver_mis_estadisticas'],
            creadoPor: 'super_user_001',
            createdAt: new Date().toISOString(),
            carrito: [],
            favoritos: []
        };
        
        users.push(vendedorUser);
        localStorage.setItem('pincelart_users', JSON.stringify(users));
        console.log('Usuario vendedor de ejemplo creado');
    }
}

function updateUserInterface() {
    console.log('Actualizando interfaz de usuario, currentUser:', currentUser);
    
    if (currentUser) {
        console.log('Usuario logueado, actualizando interfaz');
        // Mostrar nombre del usuario en algún lugar de la interfaz
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            const fullName = currentUser.name;
            const abbreviatedName = abbreviateName(fullName);
            userNameElement.textContent = `Hola, ${abbreviatedName}`;
            console.log('Nombre de usuario actualizado:', fullName, '->', abbreviatedName);
        }
        
        // Ocultar botones de registro y login, mostrar logout
        const btnRegister = document.querySelector('.btn-register');
        const btnLogin = document.querySelector('.btn-login');
        const btnLogout = document.querySelector('.btn-logout');
        
        if (btnRegister) btnRegister.style.display = 'none';
        if (btnLogin) btnLogin.style.display = 'none';
        if (btnLogout) btnLogout.style.display = 'block';
        
        // Mostrar botón de logout
        const logoutButton = document.querySelector('.btn-logout');
        if (logoutButton) {
            logoutButton.textContent = 'Cerrar Sesión';
            logoutButton.onclick = function() {
                logout();
            };
        }
        
        // Mostrar botón de administración si es admin/vendedor
        mostrarBotonAdmin();
    } else {
        // Usuario no logueado - mostrar opciones de login y registro
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = 'Usuario';
        }
        
        // Mostrar botones de registro y login, ocultar logout
        const btnRegister = document.querySelector('.btn-register');
        const btnLogin = document.querySelector('.btn-login');
        const btnLogout = document.querySelector('.btn-logout');
        
        if (btnRegister) btnRegister.style.display = 'block';
        if (btnLogin) btnLogin.style.display = 'block';
        if (btnLogout) btnLogout.style.display = 'none';
        
        // Mostrar botón de login en lugar de logout
        const logoutButton = document.querySelector('.btn-logout');
        if (logoutButton) {
            logoutButton.textContent = 'Iniciar Sesión';
            logoutButton.onclick = function() {
                window.location.href = 'login.html';
            };
        }
    }
    
    // Actualizar contadores siempre
    actualizarContadores();
}

// Sistema de permisos simplificado
const PERMISOS = {
    SUPER_USUARIO: ['*'], // Todos los permisos
    VENDEDOR: ['gestion_mis_productos', 'ver_mis_ventas', 'ver_mis_estadisticas'],
    CLIENTE: ['comprar', 'ver_productos']
};

function tienePermiso(permiso) {
    if (!currentUser) return false;
    
    // Super usuario tiene todos los permisos
    if (currentUser.rol === 'super_usuario' || currentUser.permisos.includes('*')) {
        return true;
    }
    
    // Verificar permisos específicos
    return currentUser.permisos.includes(permiso);
}

function puedeAccederPanelAdmin() {
    if (!currentUser) return false;
    
    // Solo el usuario pivancarvajal@gmail.com puede acceder al panel admin
    if (currentUser.email === 'pivancarvajal@gmail.com') {
        return true;
    }
    
    return false;
}

function mostrarPanelAdministracion() {
    console.log('Mostrando panel de administración para:', currentUser.rol);
    
    // Crear modal si no existe
    let modal = document.getElementById('modal-admin');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-admin';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-contenido modal-admin-contenido">
                <div class="modal-header">
                    <h3>Panel de Administración</h3>
                    <button class="btn-cerrar" onclick="cerrarModalAdmin()">&times;</button>
                </div>
                <div class="modal-body" id="admin-content">
                    <!-- Contenido dinámico -->
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    // Mostrar contenido según el rol
    const adminContent = document.getElementById('admin-content');
    if (currentUser.rol === 'super_usuario') {
        adminContent.innerHTML = `
            <div class="admin-section">
                <h4>Gestión de Usuarios</h4>
                <div class="admin-buttons">
                    <button class="btn-admin" onclick="mostrarGestionUsuarios()">
                        <i class="fas fa-users"></i> Gestionar Usuarios
                    </button>
                    <button class="btn-admin" onclick="mostrarCrearUsuario()">
                        <i class="fas fa-user-plus"></i> Crear Usuario
                    </button>
                </div>
            </div>
            <div class="admin-section">
                <h4>Gestión de Productos</h4>
                <div class="admin-buttons">
                    <button class="btn-admin" onclick="mostrarGestionProductos()">
                        <i class="fas fa-box"></i> Gestionar Productos
                    </button>
                    <button class="btn-admin" onclick="mostrarAgregarProducto()">
                        <i class="fas fa-plus"></i> Agregar Producto
                    </button>
                </div>
            </div>
            <div class="admin-section">
                <h4>Reportes y Estadísticas</h4>
                <div class="admin-buttons">
                    <button class="btn-admin" onclick="mostrarReportes()">
                        <i class="fas fa-chart-bar"></i> Reportes
                    </button>
                    <button class="btn-admin" onclick="mostrarEstadisticas()">
                        <i class="fas fa-chart-line"></i> Estadísticas
                    </button>
                </div>
            </div>
        `;
    } else if (currentUser.rol === 'vendedor') {
        adminContent.innerHTML = `
            <div class="admin-section">
                <h4>Mis Productos</h4>
                <div class="admin-buttons">
                    <button class="btn-admin" onclick="mostrarMisProductos()">
                        <i class="fas fa-box"></i> Ver Mis Productos
                    </button>
                    <button class="btn-admin" onclick="mostrarAgregarProducto()">
                        <i class="fas fa-plus"></i> Agregar Producto
                    </button>
                </div>
            </div>
            <div class="admin-section">
                <h4>Ventas</h4>
                <div class="admin-buttons">
                    <button class="btn-admin" onclick="mostrarMisVentas()">
                        <i class="fas fa-shopping-cart"></i> Mis Ventas
                    </button>
                    <button class="btn-admin" onclick="mostrarMisEstadisticas()">
                        <i class="fas fa-chart-line"></i> Mis Estadísticas
                    </button>
                </div>
            </div>
        `;
    } else {
        adminContent.innerHTML = `
            <div class="admin-section">
                <h4>Acceso Denegado</h4>
                <p>No tienes permisos para acceder al panel de administración.</p>
            </div>
        `;
    }
    
    // Mostrar modal
    modal.style.display = 'flex';
}

function cerrarModalAdmin() {
    const modal = document.getElementById('modal-admin');
    if (modal) {
        modal.style.display = 'none';
    }
}

// Funciones placeholder para las acciones del admin
function mostrarGestionUsuarios() {
    alert('Función de gestión de usuarios en desarrollo');
}

function mostrarCrearUsuario() {
    alert('Función de crear usuario en desarrollo');
}

function mostrarGestionProductos() {
    alert('Función de gestión de productos en desarrollo');
}

function mostrarAgregarProducto() {
    alert('Función de agregar producto en desarrollo');
}

function mostrarReportes() {
    alert('Función de reportes en desarrollo');
}

function mostrarEstadisticas() {
    alert('Función de estadísticas en desarrollo');
}

function mostrarMisProductos() {
    alert('Función de mis productos en desarrollo');
}

function mostrarMisVentas() {
    alert('Función de mis ventas en desarrollo');
}

function mostrarMisEstadisticas() {
    alert('Función de mis estadísticas en desarrollo');
}

function mostrarBotonAdmin() {
    if (!currentUser || !puedeAccederPanelAdmin()) {
        return;
    }
    
    // Buscar si ya existe el botón de admin
    let adminButton = document.querySelector('.btn-admin-panel');
    if (!adminButton) {
        // Crear botón de administración
        adminButton = document.createElement('button');
        adminButton.className = 'btn-admin-panel';
        
        // Personalizar botón según el rol
        let buttonText = 'Panel';
        let buttonColor = 'linear-gradient(135deg, #ff9800, #ffb74d)';
        
        if (currentUser.rol === 'super_usuario') {
            buttonText = 'Super Admin';
            buttonColor = 'linear-gradient(135deg, #d32f2f, #f44336)';
        } else if (currentUser.rol === 'vendedor') {
            buttonText = 'Mis Productos';
            buttonColor = 'linear-gradient(135deg, #2e7d32, #4caf50)';
        }
        
        adminButton.innerHTML = `<i class="fas fa-cog"></i> ${buttonText}`;
        adminButton.style.cssText = `
            background: ${buttonColor};
            color: white;
            border: none;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.8rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            margin-left: 10px;
        `;
        
        adminButton.addEventListener('click', () => {
            console.log('Botón de administrador clickeado');
            window.location.href = 'admin-panel.html';
        });
        
        adminButton.addEventListener('mouseenter', () => {
            adminButton.style.transform = 'translateY(-2px)';
            adminButton.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.4)';
        });
        
        adminButton.addEventListener('mouseleave', () => {
            adminButton.style.transform = 'translateY(0)';
            adminButton.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.3)';
        });
        
        // Insertar el botón en la navegación
        const nav = document.querySelector('.nav');
        if (nav) {
            nav.appendChild(adminButton);
        }
    }
}

async function cargarProductos() {
    try {
        console.log('🔄 Cargando productos...');
        
        let productosTemp = [];
        
        // ==========================================
        // CARGA DESDE LOCALSTORAGE (FUNCIONA AHORA)
        // TODO: Cuando Firebase esté disponible, cambiar a:
        // if (window.firebaseService && window.firebaseService.initialized) { ... }
        // ==========================================
        console.log('💾 Cargando desde localStorage...');
        productosTemp = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        console.log(`📊 Productos en localStorage: ${productosTemp.length}`);
        
        // SI hay muy pocos productos (menos de 100), limpiar y cargar desde migración
        if (productosTemp.length > 0 && productosTemp.length < 100) {
            console.log('⚠️ Detectados pocos productos en localStorage. Limpiando y recargando...');
            localStorage.removeItem('pincelart_productos');
            // Recargar página automáticamente para cargar los 166 productos
            console.log('🔄 Recargando página para cargar 166 productos...');
            setTimeout(() => {
                window.location.reload();
            }, 100);
            return; // Salir temprano para evitar ejecutar el resto del código
        }
        
        // LIMPIAR DUPLICADOS
        const productosUnicos = [];
        const idsVistos = new Set();
        
        productosTemp.forEach(p => {
            if (p.id && !idsVistos.has(p.id)) {
                idsVistos.add(p.id);
                productosUnicos.push(p);
            }
        });
        
        if (productosUnicos.length === 0) {
            console.log('⚠️ No hay productos en localStorage. Intentando cargar desde migración...');
            
            // Intentar cargar desde la función de migración si está disponible
            if (typeof window.obtenerProductosLocales === 'function') {
                console.log('✅ Función de migración disponible, cargando productos...');
                const productosMigrados = window.obtenerProductosLocales();
                console.log(`📦 ${productosMigrados.length} productos de migración`);
                productosUnicos.push(...productosMigrados);
                localStorage.setItem('pincelart_productos', JSON.stringify(productosUnicos));
                console.log('✅ Productos cargados en localStorage desde migración');
            } else {
                console.log('⚠️ Función de migración no disponible. Cargando productos por defecto...');
                productosUnicos.push(...obtenerProductosPorDefecto());
                localStorage.setItem('pincelart_productos', JSON.stringify(productosUnicos));
            }
        } else if (productosTemp.length !== productosUnicos.length) {
            console.log(`🗑️ Eliminando ${productosTemp.length - productosUnicos.length} productos duplicados`);
            localStorage.setItem('pincelart_productos', JSON.stringify(productosUnicos));
        }
        
        // FILTRAR: Solo productos ACTIVOS para catálogo público
        const productosActivos = productosUnicos.filter(p => 
            p.estado === 'activo' || p.estado === 'disponible'
        );
        
        productos = productosActivos;
        console.log(`✅ ${productos.length} productos ACTIVOS cargados (de ${productosUnicos.length} totales)`);
        
    } catch (error) {
        console.error('❌ Error cargando productos:', error);
        productos = [];
    }
}

function obtenerProductosPorDefecto() {
    return [
        // GUAYABERAS - TODAS CON SUS IMÁGENES CORRECTAS
        {
            id: 'guayabera-fem-1',
            nombre: 'Guayabera Amazónica Femenina',
            descripcion: 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales.',
            categoria: 'ropa',
            precio: 65000,
            stock: 15,
            estado: 'disponible',
            imagen: 'images/productos/Ropa/Guayabera/guayaberaFem1.jpg',
            activo: true
        },
        {
            id: 'guayabera-fem-2',
            nombre: 'Guayabera Amazónica Femenina',
            descripcion: 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales.',
            categoria: 'ropa',
            precio: 65000,
            stock: 15,
            estado: 'disponible',
            imagen: 'images/productos/Ropa/Guayabera/guayaberaFem2.jpg',
            activo: true
        },
        {
            id: 'guayabera-fem-3',
            nombre: 'Guayabera Amazónica Femenina',
            descripcion: 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales.',
            categoria: 'ropa',
            precio: 65000,
            stock: 15,
            estado: 'disponible',
            imagen: 'images/productos/Ropa/Guayabera/guayaberaFem3.jpg',
            activo: true
        },
        {
            id: 'guayabera-fem-4',
            nombre: 'Guayabera Amazónica Femenina',
            descripcion: 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales.',
            categoria: 'ropa',
            precio: 65000,
            stock: 15,
            estado: 'disponible',
            imagen: 'images/productos/Ropa/Guayabera/guayaberaFem4.jpg',
            activo: true
        },
        {
            id: 'guayabera-fem-5',
            nombre: 'Guayabera Amazónica Femenina',
            descripcion: 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales.',
            categoria: 'ropa',
            precio: 65000,
            stock: 15,
            estado: 'disponible',
            imagen: 'images/productos/Ropa/Guayabera/guayaberaFem5.jpg',
            activo: true
        },
        {
            id: 'guayabera-mas-1',
            nombre: 'Guayabera Amazónica Masculina',
            descripcion: 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales.',
            categoria: 'ropa',
            precio: 65000,
            stock: 10,
            estado: 'disponible',
            imagen: 'images/productos/Ropa/Guayabera/guayaberaMas1.jpg',
            activo: true
        },
        {
            id: 'buso_001',
            nombre: 'Buso Deportivo Masculino',
            descripcion: 'Comodidad y estilo con diseños únicos de la Amazonía. Ideales para el día a día.',
            categoria: 'ropa',
            precio: 35000,
            stock: 8,
            estado: 'disponible',
            imagen: 'images/productos/Ropa/BusosHombre/busoMas1.jpg',
            activo: true
        },
        {
            id: 'chapa_001',
            nombre: 'Chapa Personalizada',
            descripcion: 'Diseño único para ti. Personalizamos con tu nombre, logo o diseño especial.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 0,
            estado: 'agotado',
            imagen: 'images/productos/accesorios/Chapas/chapa1.jpg',
            activo: true
        },
        {
            id: 'cuadro_001',
            nombre: 'Cuadro Paisaje Amazónico',
            descripcion: 'Arte amazónico para tu hogar. Paisajes y cultura en cada obra.',
            categoria: 'hogar',
            precio: 75000,
            stock: 5,
            estado: 'disponible',
            imagen: 'images/productos/hogar/Cuadros/cuadro1.jpg',
            activo: true
        }
    ];
}

function saveUserData() {
    if (currentUser) {
        currentUser.carrito = carrito;
        currentUser.favoritos = favoritos;
        
        // Actualizar en localStorage
        localStorage.setItem('pincelart_current_user', JSON.stringify(currentUser));
        
        // Actualizar en la lista de usuarios
        const users = JSON.parse(localStorage.getItem('pincelart_users')) || [];
        const userIndex = users.findIndex(u => u.id === currentUser.id);
        if (userIndex !== -1) {
            users[userIndex] = currentUser;
            localStorage.setItem('pincelart_users', JSON.stringify(users));
        }
    }
}

// Función para migrar productos a Firebase
async function migrarProductosAFirebase() {
    try {
        console.log('🚀 Iniciando migración de productos a Firebase...');
        
        if (!window.firebaseService || !window.firebaseService.initialized) {
            throw new Error('Firebase no está inicializado');
        }
        
        // Obtener todos los productos del sistema
        const productosExistentes = obtenerProductosPorDefecto();
        console.log('📦 Productos a migrar:', productosExistentes.length);
        
        let migrados = 0;
        let errores = 0;
        
        for (const producto of productosExistentes) {
            try {
                const resultado = await window.firebaseService.saveProduct(producto);
                if (resultado.success) {
                    migrados++;
                    console.log(`✅ Producto migrado: ${producto.nombre}`);
                } else {
                    errores++;
                    console.log(`❌ Error migrando: ${producto.nombre}`);
                }
            } catch (error) {
                errores++;
                console.error(`❌ Error migrando ${producto.nombre}:`, error);
            }
        }
        
        console.log(`🎉 Migración completada:`);
        console.log(`✅ Productos migrados: ${migrados}`);
        console.log(`❌ Errores: ${errores}`);
        
        // Recargar productos desde Firebase
        await cargarProductos();
        
        return {
            total: productosExistentes.length,
            migrados: migrados,
            errores: errores
        };
        
    } catch (error) {
        console.error('❌ Error en migración:', error);
        throw error;
    }
}

// Función para sincronizar productos entre Firebase y localStorage
async function sincronizarProductos() {
    try {
        console.log('🔄 Sincronizando productos...');
        
        if (window.firebaseService && window.firebaseService.initialized) {
            const resultado = await window.firebaseService.getAllProducts();
            if (resultado.success) {
                productos = resultado.data;
                localStorage.setItem('pincelart_productos', JSON.stringify(productos));
                console.log('✅ Productos sincronizados desde Firebase:', productos.length);
                return productos;
            }
        }
        
        // Fallback a localStorage
        productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        console.log('✅ Productos cargados desde localStorage:', productos.length);
        return productos;
        
    } catch (error) {
        console.error('❌ Error sincronizando productos:', error);
        productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        return productos;
    }
}

// Hacer las funciones disponibles globalmente
window.migrarProductosAFirebase = migrarProductosAFirebase;
window.sincronizarProductos = sincronizarProductos;
window.cargarProductos = cargarProductos;

function logout() {
    console.log('Cerrando sesión...');
    currentUser = null;
    carrito = [];
    favoritos = [];
    
    localStorage.removeItem('pincelart_current_user');
    localStorage.removeItem('pincelart_remember_me');
    
    // Actualizar interfaz antes de recargar
    updateUserInterface();
    
    // Mostrar mensaje de despedida
    mostrarNotificacion('Sesión cerrada correctamente', 'info');
    
    // Recargar la página para actualizar la interfaz
    setTimeout(() => {
        window.location.reload();
    }, 1000);
}

// Modificar las funciones de e-commerce para exigir login
function agregarAlCarrito(productoId) {
    console.log('Agregando al carrito:', productoId);
    console.log('Usuario actual:', currentUser);
    
    // Verificar si hay usuario logueado
    if (!currentUser) {
        console.log('No hay usuario logueado, redirigiendo a login');
        mostrarNotificacion('Debes iniciar sesión para agregar productos al carrito', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    console.log('Usuario logueado, procediendo con agregar al carrito');
    
    // Usar la función obtenerDatosProducto que ya maneja ambos sistemas
    const producto = obtenerDatosProducto(productoId);
    console.log('Producto encontrado:', producto);
    
    if (!producto) {
        console.log('Producto no encontrado para ID:', productoId);
        mostrarNotificacion('Producto no encontrado', 'error');
        return;
    }
    
    // Verificar si el producto ya está en el carrito
    const itemExistente = carrito.find(item => item.id === productoId);
    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carrito.push({ ...producto, cantidad: 1 });
    }
    
    actualizarCarrito();
    saveUserData(); // Guardar datos del usuario
    mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
}

function toggleFavorito(productoId) {
    console.log('Toggle favorito:', productoId);
    console.log('Usuario actual:', currentUser);
    
    // Verificar si hay usuario logueado
    if (!currentUser) {
        console.log('No hay usuario logueado, redirigiendo a login');
        mostrarNotificacion('Debes iniciar sesión para agregar productos a favoritos', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    console.log('Usuario logueado, procediendo con favoritos');
    
    const producto = obtenerDatosProducto(productoId);
    console.log('Producto para favorito:', producto);
    
    if (producto) {
        const index = favoritos.findIndex(item => item.id === productoId);
        if (index > -1) {
            favoritos.splice(index, 1);
            console.log('Producto removido de favoritos');
            mostrarNotificacion(`${producto.nombre} removido de favoritos`, 'info');
        } else {
            favoritos.push(producto);
            console.log('Producto agregado a favoritos');
            mostrarNotificacion(`${producto.nombre} agregado a favoritos`, 'success');
        }
        actualizarFavoritos();
        actualizarBotonFavorito(productoId);
        saveUserData(); // Guardar datos del usuario
    } else {
        console.log('Producto no encontrado para favorito ID:', productoId);
        mostrarNotificacion('Producto no encontrado', 'error');
    }
}

function comprarAhora(productoId) {
    console.log('Comprar ahora:', productoId);
    console.log('Usuario actual:', currentUser);
    
    // Verificar si hay usuario logueado
    if (!currentUser) {
        console.log('No hay usuario logueado, redirigiendo a login');
        mostrarNotificacion('Debes iniciar sesión para comprar productos', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    console.log('Usuario logueado, procediendo con compra');
    
    const producto = obtenerDatosProducto(productoId);
    console.log('Producto para compra:', producto);
    
    if (producto) {
        // Agregar al carrito y mostrar sección de carrito
        agregarAlCarrito(productoId);
        mostrarSeccion('carrito');
        mostrarNotificacion(`Redirigiendo al carrito para completar la compra de ${producto.nombre}`, 'info');
        
        // Cerrar modal si está abierto
        cerrarModal();
    } else {
        mostrarNotificacion('Producto no encontrado', 'error');
    }
}

// Función para mostrar productos en el carrito
// Función auxiliar para convertir precio de string a número
function convertirPrecioANumero(precioString) {
    if (typeof precioString === 'number') {
        return precioString;
    }
    
    // Remover símbolos y espacios, convertir a número
    const precioLimpio = precioString.toString().replace(/[$,.\s]/g, '');
    const numero = parseInt(precioLimpio);
    
    return isNaN(numero) ? 0 : numero;
}

function mostrarCarrito() {
    const carritoContenido = document.querySelector('.carrito-contenido');
    if (!carritoContenido) return;
    
    console.log('Mostrando carrito, items:', carrito.length);
    
    if (carrito.length === 0) {
        carritoContenido.innerHTML = `
            <div class="carrito-vacio">
                <div class="carrito-vacio-icon">
                    <i class="fas fa-shopping-cart" style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;"></i>
                </div>
                <h3>Tu carrito está vacío</h3>
                <p>Agrega algunos productos para comenzar tu compra</p>
                <button class="btn-volver" onclick="mostrarSeccion('productos')">Ver Productos</button>
            </div>
        `;
        return;
    }
    
    let total = 0;
    let html = '<div class="carrito-items">';
    
    carrito.forEach(item => {
        const producto = obtenerDatosProducto(item.id);
        if (!producto) {
            console.error('Producto no encontrado en carrito:', item.id);
            return; // Saltar este item si no se encuentra
        }
        
        const precioNumerico = convertirPrecioANumero(producto.precio);
        const subtotal = precioNumerico * item.cantidad;
        total += subtotal;
        
        html += `
            <div class="carrito-item" data-producto="${item.id}">
                <div class="item-imagen">
                    <img src="${producto.imagen}" alt="${producto.nombre}" onerror="this.src='images/Logo/logo-pincelart.jpg'">
                </div>
                <div class="item-info">
                    <h4>${producto.nombre}</h4>
                    <p>Precio unitario: ${producto.precio}</p>
                    <p>Cantidad: ${item.cantidad}</p>
                </div>
                <div class="item-controles">
                    <button class="btn-cantidad" onclick="cambiarCantidad('${item.id}', -1)">-</button>
                    <span class="cantidad">${item.cantidad}</span>
                    <button class="btn-cantidad" onclick="cambiarCantidad('${item.id}', 1)">+</button>
                </div>
                <div class="item-precio">
                    <span class="precio">$${subtotal.toLocaleString()}</span>
                </div>
                <div class="item-acciones">
                    <button class="btn-eliminar" onclick="eliminarDelCarrito('${item.id}')">Eliminar</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    html += `
        <div class="carrito-resumen">
            <div class="total">
                <h3>Total: $${total.toLocaleString()}</h3>
            </div>
            <div class="carrito-acciones">
                <button class="btn-limpiar" onclick="limpiarCarrito()">Limpiar Carrito</button>
                <button class="btn-comprar" onclick="procederCompra()">Proceder a Compra</button>
            </div>
        </div>
    `;
    
    carritoContenido.innerHTML = html;
}

// Función para mostrar productos en favoritos
function mostrarFavoritos() {
    const favoritosContenido = document.querySelector('.favoritos-contenido');
    if (!favoritosContenido) return;
    
    if (favoritos.length === 0) {
        favoritosContenido.innerHTML = `
            <div class="favoritos-vacio">
                <p>No tienes productos favoritos</p>
                <button class="btn-volver" onclick="mostrarSeccion('productos')">Ver Productos</button>
            </div>
        `;
        return;
    }
    
    let html = '<div class="favoritos-items">';
    
    favoritos.forEach(item => {
        const producto = obtenerDatosProducto(item.id);
        
        html += `
            <div class="favorito-item" data-producto="${item.id}">
                <div class="item-imagen">
                    <img src="${producto.imagen}" alt="${producto.nombre}">
                </div>
                <div class="item-info">
                    <h4>${producto.nombre}</h4>
                    <p>Precio: ${producto.precio}</p>
                    <p class="item-descripcion">${producto.descripcion || 'Producto artesanal amazónico'}</p>
                </div>
                <div class="item-acciones">
                    <button class="btn-carrito" onclick="agregarAlCarrito('${item.id}')">🛒 Carrito</button>
                    <button class="btn-compra" onclick="comprarAhora('${item.id}')">💳 Comprar</button>
                    <button class="btn-detalles" onclick="mostrarDetallesProducto('${item.id}')">📋 Detalles</button>
                    <button class="btn-eliminar-favorito" onclick="eliminarDeFavoritos('${item.id}')">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    });
    
    html += '</div>';
    favoritosContenido.innerHTML = html;
}

// Funciones auxiliares para el carrito
function cambiarCantidad(productoId, cambio) {
    const item = carrito.find(item => item.id === productoId);
    if (item) {
        item.cantidad += cambio;
        if (item.cantidad <= 0) {
            eliminarDelCarrito(productoId);
        } else {
            actualizarCarrito();
            mostrarCarrito();
            saveUserData();
        }
    }
}

function eliminarDelCarrito(productoId) {
    carrito = carrito.filter(item => item.id !== productoId);
    actualizarCarrito();
    mostrarCarrito();
    saveUserData();
}

// Función específica para eliminar de favoritos
function eliminarDeFavoritos(productoId) {
    console.log('Eliminando de favoritos:', productoId);
    
    // Verificar si hay usuario logueado
    if (!currentUser) {
        console.log('No hay usuario logueado, redirigiendo a login');
        mostrarNotificacion('Debes iniciar sesión para gestionar favoritos', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const producto = obtenerDatosProducto(productoId);
    if (!producto) {
        console.error('Producto no encontrado:', productoId);
        mostrarNotificacion('Producto no encontrado', 'error');
        return;
    }
    
    // Eliminar de la lista de favoritos
    const index = favoritos.findIndex(item => item.id === productoId);
    if (index > -1) {
        favoritos.splice(index, 1);
        console.log('Producto eliminado de favoritos:', producto.nombre);
        
        // Actualizar contadores
        actualizarFavoritos();
        actualizarBotonFavorito(productoId);
        
        // Guardar datos del usuario
        saveUserData();
        
        // Mostrar notificación
        mostrarNotificacion(`${producto.nombre} eliminado de favoritos`, 'info');
        
        // Actualizar la vista de favoritos
        mostrarFavoritos();
        
        console.log('Favoritos actualizados:', favoritos.length);
    } else {
        console.log('Producto no estaba en favoritos');
        mostrarNotificacion('El producto no estaba en favoritos', 'info');
    }
}

function limpiarCarrito() {
    carrito = [];
    actualizarCarrito();
    mostrarCarrito();
    saveUserData();
    mostrarNotificacion('Carrito limpiado', 'info');
}

function procederCompra() {
    if (carrito.length === 0) {
        mostrarNotificacion('Tu carrito está vacío', 'error');
        return;
    }
    
    mostrarNotificacion('Función de compra en desarrollo', 'info');
}

// Función para inicializar el menú hamburguesa
function initMenuHamburguesa() {
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav a');
    
    if (!menuToggle || !navMenu) return;
    
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);
    
    // Toggle menú
    menuToggle.addEventListener('click', function() {
        menuToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        overlay.classList.toggle('active');
        document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    });
    
    // Cerrar menú al hacer clic en overlay
    overlay.addEventListener('click', function() {
        menuToggle.classList.remove('active');
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    });
    
    // Cerrar menú al hacer clic en enlaces
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Cerrar menú
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
            
            // Si es el enlace de productos, hacer scroll suave
            if (link.getAttribute('href') === '#productos') {
                e.preventDefault();
                setTimeout(() => {
                    const productosSection = document.getElementById('productos');
                    if (productosSection) {
                        productosSection.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }, 300);
            }
        });
    });
    
    // Cerrar menú con tecla Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && navMenu.classList.contains('active')) {
            menuToggle.classList.remove('active');
            navMenu.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// Inicializar menú hamburguesa cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    initMenuHamburguesa();
});

// Los botones de compra ya están manejados en initEcommerce()

// ========== FUNCIONES DE REGISTRO DE CLIENTES ==========

// Función para abrir modal de registro
function abrirModalRegistro() {
    console.log('🎯 Abriendo modal de registro...');
    const modal = document.getElementById('modalRegistro');
    if (modal) {
        modal.style.display = 'block';
        console.log('✅ Modal de registro abierto');
    } else {
        console.error('❌ No se encontró el modal de registro');
    }
}

// Función para cerrar modal de registro
function cerrarModalRegistro() {
    console.log('🎯 Cerrando modal de registro...');
    const modal = document.getElementById('modalRegistro');
    if (modal) {
        modal.style.display = 'none';
        // Limpiar formulario
        document.getElementById('formRegistroCliente').reset();
        console.log('✅ Modal de registro cerrado');
    }
}

// Función para registrar cliente en Firebase
async function registrarClienteEnFirebase(datosCliente) {
    try {
        console.log('🎯 Registrando cliente en Firebase:', datosCliente);
        
        // Verificar si Firebase está disponible
        if (!window.firebaseDB) {
            console.error('❌ Firebase no está inicializado');
            throw new Error('Firebase no está disponible');
        }

        // Importar funciones de Firebase
        const { collection, addDoc, serverTimestamp, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js');
        
        const db = window.firebaseDB;
        
        // Verificar si el email ya existe
        const usuariosRef = collection(db, 'usuarios');
        const q = query(usuariosRef, where('email', '==', datosCliente.email));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            throw new Error('Ya existe un usuario con este email');
        }
        
        // Crear el documento del usuario
        const nuevoUsuario = {
            name: datosCliente.nombre,
            email: datosCliente.email,
            telefono: datosCliente.telefono,
            password: datosCliente.password,
            rol: 'cliente',
            activo: true,
            direccion: datosCliente.direccion || '',
            fechaCreacion: serverTimestamp(),
            fechaModificacion: serverTimestamp()
        };
        
        const docRef = await addDoc(usuariosRef, nuevoUsuario);
        console.log('✅ Cliente registrado con ID:', docRef.id);
        
        return { success: true, id: docRef.id };
        
    } catch (error) {
        console.error('❌ Error registrando cliente:', error);
        throw error;
    }
}

// Función para registrar cliente en LocalStorage (fallback)
function registrarClienteEnLocalStorage(datosCliente) {
    try {
        console.log('🎯 Registrando cliente en LocalStorage:', datosCliente);
        
        // Obtener usuarios existentes
        let usuarios = JSON.parse(localStorage.getItem('pincelart_users')) || [];
        
        // Verificar si el email ya existe
        const emailExiste = usuarios.some(usuario => usuario.email === datosCliente.email);
        if (emailExiste) {
            throw new Error('Ya existe un usuario con este email');
        }
        
        // Crear nuevo usuario
        const nuevoUsuario = {
            id: Date.now().toString(),
            name: datosCliente.nombre,
            email: datosCliente.email,
            telefono: datosCliente.telefono,
            password: datosCliente.password,
            rol: 'cliente',
            activo: true,
            direccion: datosCliente.direccion || '',
            fechaCreacion: new Date().toISOString(),
            fechaModificacion: new Date().toISOString()
        };
        
        // Agregar a la lista
        usuarios.push(nuevoUsuario);
        
        // Guardar en LocalStorage
        localStorage.setItem('pincelart_users', JSON.stringify(usuarios));
        console.log('✅ Cliente registrado en LocalStorage con ID:', nuevoUsuario.id);
        
        return { success: true, id: nuevoUsuario.id };
        
    } catch (error) {
        console.error('❌ Error registrando cliente en LocalStorage:', error);
        throw error;
    }
}

// Función para manejar el envío del formulario de registro
async function manejarRegistroCliente(event) {
    event.preventDefault();
    console.log('🎯 Procesando registro de cliente...');
    
    try {
        // Obtener datos del formulario
        const formData = new FormData(event.target);
        const datosCliente = {
            nombre: formData.get('nombre'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            password: formData.get('password'),
            confirmarPassword: formData.get('confirmarPassword'),
            direccion: formData.get('direccion')
        };
        
        // Validaciones
        if (datosCliente.password !== datosCliente.confirmarPassword) {
            throw new Error('Las contraseñas no coinciden');
        }
        
        if (datosCliente.password.length < 6) {
            throw new Error('La contraseña debe tener al menos 6 caracteres');
        }
        
        // Mostrar loading
        const btnRegistrar = event.target.querySelector('.btn-registrar');
        const textoOriginal = btnRegistrar.textContent;
        btnRegistrar.textContent = 'Registrando...';
        btnRegistrar.disabled = true;
        
        let resultado;
        
        // Intentar registrar en Firebase primero
        try {
            resultado = await registrarClienteEnFirebase(datosCliente);
            console.log('✅ Registro exitoso en Firebase');
        } catch (firebaseError) {
            console.warn('⚠️ Error en Firebase, usando LocalStorage:', firebaseError.message);
            resultado = registrarClienteEnLocalStorage(datosCliente);
        }
        
        if (resultado.success) {
            // Mostrar mensaje de éxito
            alert('¡Registro exitoso! Ya puedes iniciar sesión con tus credenciales.');
            
            // Cerrar modal y limpiar formulario
            cerrarModalRegistro();
            
            // Opcional: redirigir al login
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1000);
        }
        
    } catch (error) {
        console.error('❌ Error en registro:', error);
        alert('Error al registrarse: ' + error.message);
    } finally {
        // Restaurar botón
        const btnRegistrar = event.target.querySelector('.btn-registrar');
        btnRegistrar.textContent = 'Registrarse';
        btnRegistrar.disabled = false;
    }
}

// ========== FUNCIONES DE REGISTRO DE CLIENTES ==========
