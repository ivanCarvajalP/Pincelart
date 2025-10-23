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

// Cuando la página carga
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ PincelArt cargado');
    
    // Verificar si hay usuario logueado
    checkUserSession();
    
    // Mostrar todas las secciones por defecto excepto carrito y favoritos
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
    
// Debug para verificar imagen de pulsera
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
            console.log('❌ Error al cargar imagen de pulsera');
        };
    } else {
        console.log('❌ No se encontró la imagen de pulseras');
    }
}, 1000);

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
                mostrarCarrito();
            }
            
            // Si es la sección de favoritos, mostrar productos
            if (seccion === 'favoritos') {
                mostrarFavoritos();
            }
        }
    }
}

// Funciones de e-commerce básicas
function initEcommerce() {
    console.log('Inicializando e-commerce...');
    
    // Event listeners para botones de carrito y favoritos
    document.addEventListener('click', function(e) {
        console.log('Click detectado en:', e.target);
        
        if (e.target.classList.contains('btn-carrito')) {
            const productoCard = e.target.closest('.producto-card');
            if (productoCard) {
                const productoId = productoCard.dataset.producto;
                console.log('Botón carrito clickeado, producto ID:', productoId);
                agregarAlCarrito(productoId);
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

function agregarAlCarrito(productoId) {
    const producto = obtenerDatosProducto(productoId);
    if (producto) {
        const itemExistente = carrito.find(item => item.id === productoId);
        if (itemExistente) {
            itemExistente.cantidad += 1;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }
        actualizarCarrito();
        mostrarNotificacion(`${producto.nombre} agregado al carrito`);
    }
}

function toggleFavorito(productoId) {
    const producto = obtenerDatosProducto(productoId);
    if (producto) {
        const index = favoritos.findIndex(item => item.id === productoId);
        if (index > -1) {
            favoritos.splice(index, 1);
        } else {
            favoritos.push(producto);
        }
        actualizarFavoritos();
        actualizarBotonFavorito(productoId);
    }
}

function comprarAhora(productoId) {
    agregarAlCarrito(productoId);
    mostrarSeccion('carrito');
}

function obtenerDatosProducto(productoId) {
    console.log('Buscando producto con ID:', productoId);
    
    // Buscar el producto en todos los tipos
    const tipos = ['guayabera', 'buso', 'conjunto', 'cuadro', 'chapa', 'poncho', 'gorra', 'sombrero', 'bolso', 'monedero', 'porta-celular', 'pocillo', 'arete', 'arete-collar', 'iman-nevera', 'monia', 'pulsera'];
    
    for (let tipo of tipos) {
        const productos = obtenerProductosTipo(tipo);
        const encontrado = productos.find(p => p.id === productoId);
        if (encontrado) {
            console.log('Producto encontrado:', encontrado);
            return encontrado;
        }
    }
    
    console.log('Producto no encontrado:', productoId);
    return null;
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
                <span class="precio">${producto.precio}</span>
                <span class="categoria">${producto.categoria}</span>
            </div>
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
    console.log('Tipo de dato:', typeof tipo);
    
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

// Filtros de categorías
function initFiltrosCategorias() {
    const filtros = document.querySelectorAll('.filtro-btn');
    const productos = document.querySelectorAll('.producto-card');
    
    filtros.forEach(filtro => {
        filtro.addEventListener('click', () => {
            // Remover clase active de todos los filtros
            filtros.forEach(f => f.classList.remove('active'));
            // Agregar clase active al filtro clickeado
            filtro.classList.add('active');
            
            const categoria = filtro.getAttribute('data-categoria');
            
            productos.forEach(producto => {
                if (categoria === 'todos' || producto.getAttribute('data-categoria') === categoria) {
                    producto.style.display = 'block';
                    producto.classList.remove('hidden');
                } else {
                    producto.style.display = 'none';
                    producto.classList.add('hidden');
                }
            });
        });
    });
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
        
        // Mostrar botón de logout
        const logoutButton = document.querySelector('.btn-logout');
        if (logoutButton) {
            logoutButton.textContent = 'Cerrar Sesión';
            logoutButton.onclick = function() {
                logout();
            };
        }
    } else {
        // Usuario no logueado - mostrar opciones de login
        const userNameElement = document.querySelector('.user-name');
        if (userNameElement) {
            userNameElement.textContent = 'Invitado';
        }
        
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
    
    const producto = obtenerDatosProducto(productoId);
    console.log('Producto encontrado:', producto);
    
    if (producto) {
        const itemExistente = carrito.find(item => item.id === productoId);
        if (itemExistente) {
            itemExistente.cantidad += 1;
        } else {
            carrito.push({ ...producto, cantidad: 1 });
        }
        actualizarCarrito();
        saveUserData(); // Guardar datos del usuario
        mostrarNotificacion(`${producto.nombre} agregado al carrito`, 'success');
    } else {
        console.log('Producto no encontrado para ID:', productoId);
        mostrarNotificacion('Producto no encontrado', 'error');
    }
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
    
    if (carrito.length === 0) {
        carritoContenido.innerHTML = `
            <div class="carrito-vacio">
                <p>Tu carrito está vacío</p>
                <button class="btn-volver" onclick="mostrarSeccion('productos')">Ver Productos</button>
            </div>
        `;
        return;
    }
    
    let total = 0;
    let html = '<div class="carrito-items">';
    
    carrito.forEach(item => {
        const producto = obtenerDatosProducto(item.id);
        const precioNumerico = convertirPrecioANumero(producto.precio);
        const subtotal = precioNumerico * item.cantidad;
        total += subtotal;
        
        html += `
            <div class="carrito-item" data-producto="${item.id}">
                <div class="item-imagen">
                    <img src="${producto.imagen}" alt="${producto.nombre}">
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

// Los botones de compra ya están manejados en initEcommerce()
