// Utilidades de Firebase
import { 
    collection, 
    doc, 
    getDocs, 
    getDoc, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy,
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Sistema de Administración para PincelArt
class AdminSystem {
    constructor() {
        this.currentUser = null;
        this.productos = [];
        this.clientes = [];
        this.ventas = [];
        this.vendedores = [];
        this.productoEditando = null;
        this.vendedorEditando = null;
        this.db = null;
        this.init();
    }

    async init() {
        this.verificarAccesoAdmin();
        await this.inicializarFirebase();
        await this.cargarDatos();
        this.setupEventListeners();
        this.actualizarDashboard();
        await this.cargarProductos();
        await this.cargarVendedores();
    }

    async inicializarFirebase() {
        try {
            // Esperar a que Firebase esté disponible
            while (!window.firebaseDB) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            this.db = window.firebaseDB;
            console.log("Firebase inicializado correctamente");
        } catch (error) {
            console.error("Error inicializando Firebase:", error);
            this.mostrarMensaje("Error conectando con la base de datos", "error");
        }
    }

    verificarAccesoAdmin() {
        const user = JSON.parse(localStorage.getItem('pincelart_current_user'));
        
        if (!user) {
            this.mostrarMensaje('Debes iniciar sesión para acceder al panel de administración', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        // Verificar si el usuario es administrador/vendedor
        if (user.rol !== 'admin' && user.rol !== 'vendedor') {
            this.mostrarMensaje('No tienes permisos para acceder al panel de administración', 'error');
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 2000);
            return;
        }

        this.currentUser = user;
        this.actualizarInterfazUsuario();
    }

    actualizarInterfazUsuario() {
        const userNameElement = document.getElementById('adminUserName');
        if (userNameElement) {
            userNameElement.textContent = this.currentUser.name;
        }
    }

    async cargarDatos() {
        try {
            if (this.db) {
                // Cargar desde Firebase
                await this.cargarProductosFirebase();
                await this.cargarVendedoresFirebase();
                await this.cargarVentasFirebase();
            } else {
                // Fallback a localStorage
                this.cargarDatosLocalStorage();
            }
        } catch (error) {
            console.error("Error cargando datos:", error);
            this.cargarDatosLocalStorage(); // Fallback
        }
    }

    cargarDatosLocalStorage() {
        // Cargar productos desde localStorage
        this.productos = JSON.parse(localStorage.getItem('pincelart_productos')) || this.obtenerProductosIniciales();
        
        // Cargar clientes desde localStorage
        this.clientes = JSON.parse(localStorage.getItem('pincelart_users')) || [];
        
        // Cargar ventas desde localStorage
        this.ventas = JSON.parse(localStorage.getItem('pincelart_ventas')) || [];
        
        // Cargar vendedores desde localStorage
        this.vendedores = JSON.parse(localStorage.getItem('pincelart_users')) || [];
    }

    async cargarProductosFirebase() {
        try {
            const querySnapshot = await getDocs(collection(this.db, "productos"));
            this.productos = [];
            querySnapshot.forEach((doc) => {
                this.productos.push({ id: doc.id, ...doc.data() });
            });
        } catch (error) {
            console.error("Error cargando productos desde Firebase:", error);
            this.cargarDatosLocalStorage();
        }
    }

    async cargarVendedoresFirebase() {
        try {
            const querySnapshot = await getDocs(collection(this.db, "usuarios"));
            this.vendedores = [];
            querySnapshot.forEach((doc) => {
                this.vendedores.push({ id: doc.id, ...doc.data() });
            });
        } catch (error) {
            console.error("Error cargando vendedores desde Firebase:", error);
            this.cargarDatosLocalStorage();
        }
    }

    async cargarVentasFirebase() {
        try {
            const querySnapshot = await getDocs(collection(this.db, "ventas"));
            this.ventas = [];
            querySnapshot.forEach((doc) => {
                this.ventas.push({ id: doc.id, ...doc.data() });
            });
        } catch (error) {
            console.error("Error cargando ventas desde Firebase:", error);
            this.cargarDatosLocalStorage();
        }
    }

    obtenerProductosIniciales() {
        // Productos iniciales con la nueva estructura
        return [
            {
                id: 'guayabera_001',
                nombre: 'Guayabera Amazónica Femenina',
                descripcion: 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales.',
                categoria: 'ropa',
                precio: 65000,
                stock: 15,
                estado: 'disponible',
                imagen: 'images/productos/Ropa/Guayabera/guayaberaFem1.jpg',
                fechaCreacion: new Date().toISOString(),
                fechaModificacion: new Date().toISOString(),
                vendedorId: this.currentUser?.id || 'admin_001',
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
                fechaCreacion: new Date().toISOString(),
                fechaModificacion: new Date().toISOString(),
                vendedorId: this.currentUser?.id || 'admin_001',
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
                fechaCreacion: new Date().toISOString(),
                fechaModificacion: new Date().toISOString(),
                vendedorId: this.currentUser?.id || 'admin_001',
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
                fechaCreacion: new Date().toISOString(),
                fechaModificacion: new Date().toISOString(),
                vendedorId: this.currentUser?.id || 'admin_001',
                activo: true
            }
        ];
    }

    setupEventListeners() {
        // Navegación del panel
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.mostrarSeccion(section);
            });
        });

        // Formulario de producto
        document.getElementById('formProducto').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarProducto();
        });

        // Formulario de vendedor
        document.getElementById('formVendedor').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarVendedor();
        });

        // Filtros de productos
        document.getElementById('buscarProducto').addEventListener('input', () => {
            this.filtrarProductos();
        });

        document.getElementById('filtroCategoria').addEventListener('change', () => {
            this.filtrarProductos();
        });

        document.getElementById('filtroEstado').addEventListener('change', () => {
            this.filtrarProductos();
        });

        // Filtros de vendedores
        document.getElementById('buscarVendedor').addEventListener('input', () => {
            this.filtrarVendedores();
        });

        document.getElementById('filtroEstadoVendedor').addEventListener('change', () => {
            this.filtrarVendedores();
        });

        document.getElementById('filtroRolVendedor').addEventListener('change', () => {
            this.filtrarVendedores();
        });

        // Cerrar modales al hacer clic fuera
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.cerrarModal(modal);
                }
            });
        });
    }

    mostrarSeccion(seccionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Mostrar la sección seleccionada
        document.getElementById(seccionId).classList.add('active');

        // Actualizar navegación
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-section="${seccionId}"]`).classList.add('active');

        // Cargar datos específicos de la sección
        if (seccionId === 'productos') {
            this.cargarProductos();
        } else if (seccionId === 'vendedores') {
            this.cargarVendedores();
        } else if (seccionId === 'dashboard') {
            this.actualizarDashboard();
        }
    }

    actualizarDashboard() {
        const totalProductos = this.productos.length;
        const productosDisponibles = this.productos.filter(p => p.estado === 'disponible').length;
        const productosAgotados = this.productos.filter(p => p.estado === 'agotado').length;
        const totalClientes = this.clientes.length;

        document.getElementById('totalProductos').textContent = totalProductos;
        document.getElementById('productosDisponibles').textContent = productosDisponibles;
        document.getElementById('productosAgotados').textContent = productosAgotados;
        document.getElementById('totalClientes').textContent = totalClientes;

        this.actualizarGraficos();
    }

    actualizarGraficos() {
        // Gráfico de productos por categoría
        const categoriaData = this.obtenerDatosCategoria();
        this.crearGraficoCategoria(categoriaData);

        // Gráfico de estado de inventario
        const estadoData = this.obtenerDatosEstado();
        this.crearGraficoEstado(estadoData);
    }

    obtenerDatosCategoria() {
        const categorias = {};
        this.productos.forEach(producto => {
            categorias[producto.categoria] = (categorias[producto.categoria] || 0) + 1;
        });
        return categorias;
    }

    obtenerDatosEstado() {
        const estados = {};
        this.productos.forEach(producto => {
            estados[producto.estado] = (estados[producto.estado] || 0) + 1;
        });
        return estados;
    }

    crearGraficoCategoria(datos) {
        const ctx = document.getElementById('categoriaChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(datos),
                datasets: [{
                    data: Object.values(datos),
                    backgroundColor: [
                        '#2e7d32',
                        '#1976d2',
                        '#d32f2f',
                        '#ff9800'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    crearGraficoEstado(datos) {
        const ctx = document.getElementById('estadoChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(datos),
                datasets: [{
                    label: 'Cantidad',
                    data: Object.values(datos),
                    backgroundColor: [
                        '#4caf50',
                        '#f44336',
                        '#ff9800'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    cargarProductos() {
        const tbody = document.getElementById('productosTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">
                </td>
                <td>
                    <div class="producto-nombre">${producto.nombre}</div>
                    <div class="producto-descripcion">${producto.descripcion.substring(0, 50)}...</div>
                </td>
                <td>
                    <span class="producto-categoria">${producto.categoria}</span>
                </td>
                <td>
                    <span class="producto-precio">$${producto.precio.toLocaleString()}</span>
                </td>
                <td>
                    <span class="producto-stock">${producto.stock}</span>
                </td>
                <td>
                    <span class="estado-badge estado-${producto.estado}">${producto.estado}</span>
                </td>
                <td>
                    <div class="acciones-producto">
                        <button class="btn-accion btn-editar" onclick="admin.editarProducto('${producto.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-accion btn-toggle" onclick="admin.toggleEstadoProducto('${producto.id}')" title="Cambiar Estado">
                            <i class="fas fa-toggle-on"></i>
                        </button>
                        <button class="btn-accion btn-eliminar" onclick="admin.eliminarProducto('${producto.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    filtrarProductos() {
        const busqueda = document.getElementById('buscarProducto').value.toLowerCase();
        const categoria = document.getElementById('filtroCategoria').value;
        const estado = document.getElementById('filtroEstado').value;

        const productosFiltrados = this.productos.filter(producto => {
            const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda) ||
                                   producto.descripcion.toLowerCase().includes(busqueda);
            const coincideCategoria = !categoria || producto.categoria === categoria;
            const coincideEstado = !estado || producto.estado === estado;

            return coincideBusqueda && coincideCategoria && coincideEstado;
        });

        this.mostrarProductosFiltrados(productosFiltrados);
    }

    mostrarProductosFiltrados(productos) {
        const tbody = document.getElementById('productosTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        productos.forEach(producto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <img src="${producto.imagen}" alt="${producto.nombre}" class="producto-imagen">
                </td>
                <td>
                    <div class="producto-nombre">${producto.nombre}</div>
                    <div class="producto-descripcion">${producto.descripcion.substring(0, 50)}...</div>
                </td>
                <td>
                    <span class="producto-categoria">${producto.categoria}</span>
                </td>
                <td>
                    <span class="producto-precio">$${producto.precio.toLocaleString()}</span>
                </td>
                <td>
                    <span class="producto-stock">${producto.stock}</span>
                </td>
                <td>
                    <span class="estado-badge estado-${producto.estado}">${producto.estado}</span>
                </td>
                <td>
                    <div class="acciones-producto">
                        <button class="btn-accion btn-editar" onclick="admin.editarProducto('${producto.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-accion btn-toggle" onclick="admin.toggleEstadoProducto('${producto.id}')" title="Cambiar Estado">
                            <i class="fas fa-toggle-on"></i>
                        </button>
                        <button class="btn-accion btn-eliminar" onclick="admin.eliminarProducto('${producto.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    abrirModalProducto(productoId = null) {
        const modal = document.getElementById('modalProducto');
        const titulo = document.getElementById('modalProductoTitulo');
        const form = document.getElementById('formProducto');

        if (productoId) {
            // Editar producto existente
            this.productoEditando = this.productos.find(p => p.id === productoId);
            titulo.textContent = 'Editar Producto';
            this.llenarFormularioProducto(this.productoEditando);
        } else {
            // Nuevo producto
            this.productoEditando = null;
            titulo.textContent = 'Nuevo Producto';
            form.reset();
        }

        modal.classList.add('active');
    }

    cerrarModalProducto() {
        const modal = document.getElementById('modalProducto');
        modal.classList.remove('active');
        this.productoEditando = null;
    }

    llenarFormularioProducto(producto) {
        document.getElementById('productoNombre').value = producto.nombre;
        document.getElementById('productoDescripcion').value = producto.descripcion;
        document.getElementById('productoCategoria').value = producto.categoria;
        document.getElementById('productoPrecio').value = producto.precio;
        document.getElementById('productoStock').value = producto.stock;
        document.getElementById('productoEstado').value = producto.estado;
        document.getElementById('productoImagen').value = producto.imagen;
    }

    guardarProducto() {
        const formData = new FormData(document.getElementById('formProducto'));
        
        const producto = {
            nombre: formData.get('nombre'),
            descripcion: formData.get('descripcion'),
            categoria: formData.get('categoria'),
            precio: parseInt(formData.get('precio')),
            stock: parseInt(formData.get('stock')),
            estado: formData.get('estado'),
            imagen: formData.get('imagen'),
            vendedorId: this.currentUser.id,
            fechaModificacion: new Date().toISOString(),
            activo: true
        };

        if (this.productoEditando) {
            // Actualizar producto existente
            producto.id = this.productoEditando.id;
            producto.fechaCreacion = this.productoEditando.fechaCreacion;
            
            const index = this.productos.findIndex(p => p.id === producto.id);
            this.productos[index] = producto;
            
            this.mostrarMensaje('Producto actualizado correctamente', 'success');
        } else {
            // Crear nuevo producto
            producto.id = 'producto_' + Date.now();
            producto.fechaCreacion = new Date().toISOString();
            
            this.productos.push(producto);
            this.mostrarMensaje('Producto creado correctamente', 'success');
        }

        this.guardarProductos();
        this.cargarProductos();
        this.actualizarDashboard();
        this.cerrarModalProducto();
    }

    editarProducto(productoId) {
        this.abrirModalProducto(productoId);
    }

    toggleEstadoProducto(productoId) {
        const producto = this.productos.find(p => p.id === productoId);
        if (!producto) return;

        const estados = ['disponible', 'agotado', 'descontinuado'];
        const indiceActual = estados.indexOf(producto.estado);
        const nuevoIndice = (indiceActual + 1) % estados.length;
        
        producto.estado = estados[nuevoIndice];
        producto.fechaModificacion = new Date().toISOString();

        this.guardarProductos();
        this.cargarProductos();
        this.actualizarDashboard();
        
        this.mostrarMensaje(`Estado cambiado a: ${producto.estado}`, 'info');
    }

    eliminarProducto(productoId) {
        const producto = this.productos.find(p => p.id === productoId);
        if (!producto) return;

        this.mostrarConfirmacion(
            `¿Estás seguro de eliminar el producto "${producto.nombre}"?`,
            () => {
                this.productos = this.productos.filter(p => p.id !== productoId);
                this.guardarProductos();
                this.cargarProductos();
                this.actualizarDashboard();
                this.mostrarMensaje('Producto eliminado correctamente', 'success');
            }
        );
    }

    mostrarConfirmacion(mensaje, callback) {
        const modal = document.getElementById('modalConfirmacion');
        const mensajeElement = document.getElementById('confirmacionMensaje');
        const botonConfirmar = document.getElementById('confirmarAccion');

        mensajeElement.textContent = mensaje;
        
        // Remover listeners anteriores
        const nuevoBoton = botonConfirmar.cloneNode(true);
        botonConfirmar.parentNode.replaceChild(nuevoBoton, botonConfirmar);
        
        // Agregar nuevo listener
        nuevoBoton.addEventListener('click', () => {
            callback();
            this.cerrarModalConfirmacion();
        });

        modal.classList.add('active');
    }

    cerrarModalConfirmacion() {
        const modal = document.getElementById('modalConfirmacion');
        modal.classList.remove('active');
    }

    cerrarModal(modal) {
        modal.classList.remove('active');
    }

    guardarProductos() {
        localStorage.setItem('pincelart_productos', JSON.stringify(this.productos));
    }

    mostrarMensaje(mensaje, tipo) {
        // Crear notificación
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.textContent = mensaje;
        notificacion.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 10001;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        `;

        // Aplicar colores según el tipo
        switch (tipo) {
            case 'success':
                notificacion.style.background = 'linear-gradient(135deg, #4caf50, #66bb6a)';
                break;
            case 'error':
                notificacion.style.background = 'linear-gradient(135deg, #f44336, #ef5350)';
                break;
            case 'info':
                notificacion.style.background = 'linear-gradient(135deg, #2196f3, #42a5f5)';
                break;
        }

        document.body.appendChild(notificacion);

        // Remover después de 3 segundos
        setTimeout(() => {
            notificacion.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notificacion.parentNode) {
                    notificacion.parentNode.removeChild(notificacion);
                }
            }, 300);
        }, 3000);
    }

    // ========== FUNCIONES DE VENDEDORES ==========

    async cargarVendedores() {
        const tbody = document.getElementById('vendedoresTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.vendedores.forEach(vendedor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="vendedor-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                </td>
                <td>
                    <div class="vendedor-nombre">${vendedor.name || vendedor.nombre}</div>
                    <div class="vendedor-direccion">${vendedor.direccion || 'Sin dirección'}</div>
                </td>
                <td>
                    <span class="vendedor-email">${vendedor.email}</span>
                </td>
                <td>
                    <span class="vendedor-telefono">${vendedor.telefono || 'Sin teléfono'}</span>
                </td>
                <td>
                    <span class="rol-badge rol-${vendedor.rol}">${vendedor.rol}</span>
                </td>
                <td>
                    <span class="estado-badge estado-${vendedor.estado || 'activo'}">${vendedor.estado || 'activo'}</span>
                </td>
                <td>
                    <span class="vendedor-fecha">${this.formatearFecha(vendedor.fechaCreacion)}</span>
                </td>
                <td>
                    <div class="acciones-vendedor">
                        <button class="btn-accion btn-editar" onclick="admin.editarVendedor('${vendedor.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-accion btn-toggle" onclick="admin.toggleEstadoVendedor('${vendedor.id}')" title="Cambiar Estado">
                            <i class="fas fa-toggle-on"></i>
                        </button>
                        <button class="btn-accion btn-eliminar" onclick="admin.eliminarVendedor('${vendedor.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    filtrarVendedores() {
        const busqueda = document.getElementById('buscarVendedor').value.toLowerCase();
        const estado = document.getElementById('filtroEstadoVendedor').value;
        const rol = document.getElementById('filtroRolVendedor').value;

        const vendedoresFiltrados = this.vendedores.filter(vendedor => {
            const coincideBusqueda = (vendedor.name || vendedor.nombre || '').toLowerCase().includes(busqueda) ||
                                   (vendedor.email || '').toLowerCase().includes(busqueda);
            const coincideEstado = !estado || (vendedor.estado || 'activo') === estado;
            const coincideRol = !rol || vendedor.rol === rol;

            return coincideBusqueda && coincideEstado && coincideRol;
        });

        this.mostrarVendedoresFiltrados(vendedoresFiltrados);
    }

    mostrarVendedoresFiltrados(vendedores) {
        const tbody = document.getElementById('vendedoresTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        vendedores.forEach(vendedor => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>
                    <div class="vendedor-avatar">
                        <i class="fas fa-user-circle"></i>
                    </div>
                </td>
                <td>
                    <div class="vendedor-nombre">${vendedor.name || vendedor.nombre}</div>
                    <div class="vendedor-direccion">${vendedor.direccion || 'Sin dirección'}</div>
                </td>
                <td>
                    <span class="vendedor-email">${vendedor.email}</span>
                </td>
                <td>
                    <span class="vendedor-telefono">${vendedor.telefono || 'Sin teléfono'}</span>
                </td>
                <td>
                    <span class="rol-badge rol-${vendedor.rol}">${vendedor.rol}</span>
                </td>
                <td>
                    <span class="estado-badge estado-${vendedor.estado || 'activo'}">${vendedor.estado || 'activo'}</span>
                </td>
                <td>
                    <span class="vendedor-fecha">${this.formatearFecha(vendedor.fechaCreacion)}</span>
                </td>
                <td>
                    <div class="acciones-vendedor">
                        <button class="btn-accion btn-editar" onclick="admin.editarVendedor('${vendedor.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-accion btn-toggle" onclick="admin.toggleEstadoVendedor('${vendedor.id}')" title="Cambiar Estado">
                            <i class="fas fa-toggle-on"></i>
                        </button>
                        <button class="btn-accion btn-eliminar" onclick="admin.eliminarVendedor('${vendedor.id}')" title="Eliminar">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    abrirModalVendedor(vendedorId = null) {
        const modal = document.getElementById('modalVendedor');
        const titulo = document.getElementById('modalVendedorTitulo');
        const form = document.getElementById('formVendedor');

        if (vendedorId) {
            // Editar vendedor existente
            this.vendedorEditando = this.vendedores.find(v => v.id === vendedorId);
            titulo.textContent = 'Editar Vendedor';
            this.llenarFormularioVendedor(this.vendedorEditando);
        } else {
            // Nuevo vendedor
            this.vendedorEditando = null;
            titulo.textContent = 'Registrar Vendedor';
            form.reset();
        }

        modal.classList.add('active');
    }

    cerrarModalVendedor() {
        const modal = document.getElementById('modalVendedor');
        modal.classList.remove('active');
        this.vendedorEditando = null;
    }

    llenarFormularioVendedor(vendedor) {
        document.getElementById('vendedorNombre').value = vendedor.name || vendedor.nombre || '';
        document.getElementById('vendedorEmail').value = vendedor.email || '';
        document.getElementById('vendedorTelefono').value = vendedor.telefono || '';
        document.getElementById('vendedorRol').value = vendedor.rol || '';
        document.getElementById('vendedorPassword').value = ''; // No mostrar contraseña
        document.getElementById('vendedorEstado').value = vendedor.estado || 'activo';
        document.getElementById('vendedorDireccion').value = vendedor.direccion || '';
    }

    async guardarVendedor() {
        const formData = new FormData(document.getElementById('formVendedor'));
        
        const vendedor = {
            name: formData.get('nombre'),
            email: formData.get('email'),
            telefono: formData.get('telefono'),
            rol: formData.get('rol'),
            password: formData.get('password'),
            estado: formData.get('estado'),
            direccion: formData.get('direccion'),
            fechaModificacion: new Date().toISOString(),
            activo: true
        };

        try {
            if (this.vendedorEditando) {
                // Actualizar vendedor existente
                if (this.db) {
                    const docRef = doc(this.db, "usuarios", this.vendedorEditando.id);
                    await updateDoc(docRef, {
                        ...vendedor,
                        fechaModificacion: serverTimestamp()
                    });
                } else {
                    // Fallback a localStorage
                    const index = this.vendedores.findIndex(v => v.id === this.vendedorEditando.id);
                    this.vendedores[index] = { ...this.vendedores[index], ...vendedor };
                    localStorage.setItem('pincelart_users', JSON.stringify(this.vendedores));
                }
                
                this.mostrarMensaje('Vendedor actualizado correctamente', 'success');
            } else {
                // Crear nuevo vendedor
                vendedor.id = 'vendedor_' + Date.now();
                vendedor.fechaCreacion = new Date().toISOString();
                
                if (this.db) {
                    const docRef = await addDoc(collection(this.db, "usuarios"), {
                        ...vendedor,
                        fechaCreacion: serverTimestamp(),
                        fechaModificacion: serverTimestamp()
                    });
                    vendedor.id = docRef.id;
                } else {
                    // Fallback a localStorage
                    this.vendedores.push(vendedor);
                    localStorage.setItem('pincelart_users', JSON.stringify(this.vendedores));
                }
                
                this.mostrarMensaje('Vendedor creado correctamente', 'success');
            }

            await this.cargarVendedores();
            this.cerrarModalVendedor();
        } catch (error) {
            console.error("Error guardando vendedor:", error);
            this.mostrarMensaje('Error guardando vendedor', 'error');
        }
    }

    editarVendedor(vendedorId) {
        this.abrirModalVendedor(vendedorId);
    }

    async toggleEstadoVendedor(vendedorId) {
        const vendedor = this.vendedores.find(v => v.id === vendedorId);
        if (!vendedor) return;

        const estados = ['activo', 'inactivo', 'suspendido'];
        const indiceActual = estados.indexOf(vendedor.estado || 'activo');
        const nuevoIndice = (indiceActual + 1) % estados.length;
        
        const nuevoEstado = estados[nuevoIndice];

        try {
            if (this.db) {
                const docRef = doc(this.db, "usuarios", vendedorId);
                await updateDoc(docRef, {
                    estado: nuevoEstado,
                    fechaModificacion: serverTimestamp()
                });
            } else {
                // Fallback a localStorage
                vendedor.estado = nuevoEstado;
                vendedor.fechaModificacion = new Date().toISOString();
                localStorage.setItem('pincelart_users', JSON.stringify(this.vendedores));
            }

            await this.cargarVendedores();
            this.mostrarMensaje(`Estado cambiado a: ${nuevoEstado}`, 'info');
        } catch (error) {
            console.error("Error cambiando estado:", error);
            this.mostrarMensaje('Error cambiando estado', 'error');
        }
    }

    async eliminarVendedor(vendedorId) {
        const vendedor = this.vendedores.find(v => v.id === vendedorId);
        if (!vendedor) return;

        this.mostrarConfirmacion(
            `¿Estás seguro de eliminar el vendedor "${vendedor.name || vendedor.nombre}"?`,
            async () => {
                try {
                    if (this.db) {
                        const docRef = doc(this.db, "usuarios", vendedorId);
                        await updateDoc(docRef, {
                            activo: false,
                            fechaModificacion: serverTimestamp()
                        });
                    } else {
                        // Fallback a localStorage
                        this.vendedores = this.vendedores.filter(v => v.id !== vendedorId);
                        localStorage.setItem('pincelart_users', JSON.stringify(this.vendedores));
                    }

                    await this.cargarVendedores();
                    this.mostrarMensaje('Vendedor eliminado correctamente', 'success');
                } catch (error) {
                    console.error("Error eliminando vendedor:", error);
                    this.mostrarMensaje('Error eliminando vendedor', 'error');
                }
            }
        );
    }

    formatearFecha(fecha) {
        if (!fecha) return 'Sin fecha';
        
        try {
            const fechaObj = fecha.toDate ? fecha.toDate() : new Date(fecha);
            return fechaObj.toLocaleDateString('es-ES');
        } catch (error) {
            return 'Fecha inválida';
        }
    }
}

// Funciones globales
let admin;

document.addEventListener('DOMContentLoaded', () => {
    admin = new AdminSystem();
});

function abrirModalProducto() {
    admin.abrirModalProducto();
}

function cerrarModalProducto() {
    admin.cerrarModalProducto();
}

function cerrarModalConfirmacion() {
    admin.cerrarModalConfirmacion();
}

function abrirModalVendedor() {
    admin.abrirModalVendedor();
}

function cerrarModalVendedor() {
    admin.cerrarModalVendedor();
}

function irATienda() {
    window.location.href = 'main.html';
}

function cerrarSesionAdmin() {
    localStorage.removeItem('pincelart_current_user');
    window.location.href = 'login.html';
}

// Agregar estilos para animaciones
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

