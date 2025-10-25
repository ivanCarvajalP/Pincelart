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

// Sistema de Super Administración para PincelArt
class SuperAdminSystem {
    constructor() {
        this.currentUser = null;
        this.usuarios = [];
        this.productos = [];
        this.ventas = [];
        this.usuarioEditando = null;
        this.db = null;
        this.init();
    }

    async init() {
        this.verificarAccesoSuperAdmin();
        await this.inicializarFirebase();
        await this.cargarDatos();
        this.setupEventListeners();
        this.actualizarDashboard();
        await this.cargarUsuarios();
        await this.cargarProductos();
    }

    async inicializarFirebase() {
        try {
            // Esperar a que Firebase esté disponible
            while (!window.firebaseDB) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            this.db = window.firebaseDB;
            console.log("Firebase inicializado en Super Admin correctamente");
        } catch (error) {
            console.error("Error inicializando Firebase:", error);
            this.mostrarMensaje("Error conectando con la base de datos", "error");
        }
    }

    verificarAccesoSuperAdmin() {
        const user = JSON.parse(localStorage.getItem('pincelart_current_user'));
        
        if (!user) {
            this.mostrarMensaje('Debes iniciar sesión para acceder al super panel', 'error');
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 2000);
            return;
        }

        // Verificar si el usuario es super usuario
        if (user.rol !== 'super_usuario') {
            this.mostrarMensaje('No tienes permisos para acceder al super panel de administración', 'error');
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 2000);
            return;
        }

        this.currentUser = user;
        this.actualizarInterfazUsuario();
    }

    actualizarInterfazUsuario() {
        const userNameElement = document.getElementById('superAdminUserName');
        if (userNameElement) {
            userNameElement.textContent = this.currentUser.name;
        }
    }

    async cargarDatos() {
        try {
            if (this.db) {
                // Cargar desde Firebase
                await this.cargarUsuariosFirebase();
                await this.cargarProductosFirebase();
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
        // Cargar usuarios desde localStorage
        this.usuarios = JSON.parse(localStorage.getItem('pincelart_users')) || [];
        
        // Cargar productos desde localStorage
        this.productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
        
        // Cargar ventas desde localStorage
        this.ventas = JSON.parse(localStorage.getItem('pincelart_ventas')) || [];
    }

    async cargarUsuariosFirebase() {
        try {
            const querySnapshot = await getDocs(collection(this.db, "usuarios"));
            this.usuarios = [];
            querySnapshot.forEach((doc) => {
                this.usuarios.push({ id: doc.id, ...doc.data() });
            });
        } catch (error) {
            console.error("Error cargando usuarios desde Firebase:", error);
            this.cargarDatosLocalStorage();
        }
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

    setupEventListeners() {
        // Navegación del panel
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.mostrarSeccion(section);
            });
        });

        // Formularios de usuarios
        document.getElementById('formVendedor').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarVendedor();
        });

        document.getElementById('formCliente').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarCliente();
        });

        document.getElementById('formEditarUsuario').addEventListener('submit', (e) => {
            e.preventDefault();
            this.guardarEdicionUsuario();
        });

        // Filtros de usuarios
        document.getElementById('buscarUsuario').addEventListener('input', () => {
            this.filtrarUsuarios();
        });

        document.getElementById('filtroRol').addEventListener('change', () => {
            this.filtrarUsuarios();
        });

        document.getElementById('filtroEstado').addEventListener('change', () => {
            this.filtrarUsuarios();
        });

        // Filtros de productos globales
        document.getElementById('buscarProductoGlobal').addEventListener('input', () => {
            this.filtrarProductosGlobales();
        });

        document.getElementById('filtroVendedor').addEventListener('change', () => {
            this.filtrarProductosGlobales();
        });

        document.getElementById('filtroCategoriaGlobal').addEventListener('change', () => {
            this.filtrarProductosGlobales();
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
        document.querySelectorAll('.super-admin-section').forEach(section => {
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
        if (seccionId === 'usuarios') {
            this.cargarUsuarios();
        } else if (seccionId === 'productos') {
            this.cargarProductos();
            this.cargarVendedoresEnFiltro();
        } else if (seccionId === 'dashboard') {
            this.actualizarDashboard();
        }
    }

    actualizarDashboard() {
        const totalUsuarios = this.usuarios.length;
        const totalVendedores = this.usuarios.filter(u => u.rol === 'vendedor' && u.activo).length;
        const totalProductos = this.productos.length;
        const ventasTotales = this.calcularVentasTotales();

        document.getElementById('totalUsuarios').textContent = totalUsuarios;
        document.getElementById('totalVendedores').textContent = totalVendedores;
        document.getElementById('totalProductos').textContent = totalProductos;
        document.getElementById('ventasTotales').textContent = `$${ventasTotales.toLocaleString()}`;

        this.actualizarGraficos();
    }

    calcularVentasTotales() {
        // Calcular ventas totales (esto sería más complejo en un sistema real)
        return this.ventas.reduce((total, venta) => total + (venta.total || 0), 0);
    }

    actualizarGraficos() {
        // Gráfico de usuarios por rol
        const usuariosData = this.obtenerDatosUsuarios();
        this.crearGraficoUsuarios(usuariosData);

        // Gráfico de productos por vendedor
        const vendedoresData = this.obtenerDatosVendedores();
        this.crearGraficoVendedores(vendedoresData);
    }

    obtenerDatosUsuarios() {
        const roles = {};
        this.usuarios.forEach(usuario => {
            roles[usuario.rol] = (roles[usuario.rol] || 0) + 1;
        });
        return roles;
    }

    obtenerDatosVendedores() {
        const vendedores = {};
        this.productos.forEach(producto => {
            const vendedor = this.usuarios.find(u => u.id === producto.vendedorId);
            if (vendedor) {
                const nombreVendedor = vendedor.name;
                vendedores[nombreVendedor] = (vendedores[nombreVendedor] || 0) + 1;
            }
        });
        return vendedores;
    }

    crearGraficoUsuarios(datos) {
        const ctx = document.getElementById('usuariosChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(datos).map(rol => {
                    const nombres = {
                        'super_usuario': 'Super Usuario',
                        'vendedor': 'Vendedores',
                        'cliente': 'Clientes'
                    };
                    return nombres[rol] || rol;
                }),
                datasets: [{
                    data: Object.values(datos),
                    backgroundColor: [
                        '#d32f2f',
                        '#2e7d32',
                        '#1976d2'
                    ]
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false
            }
        });
    }

    crearGraficoVendedores(datos) {
        const ctx = document.getElementById('vendedoresChart');
        if (!ctx) return;

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(datos),
                datasets: [{
                    label: 'Productos',
                    data: Object.values(datos),
                    backgroundColor: '#d32f2f'
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

    async cargarUsuarios() {
        const tbody = document.getElementById('usuariosTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.usuarios.forEach(usuario => {
            const row = document.createElement('tr');
            const iniciales = (usuario.name || usuario.nombre || '').split(' ').map(n => n[0]).join('').toUpperCase();
            
            row.innerHTML = `
                <td>
                    <div class="usuario-info">
                        <div class="usuario-avatar">${iniciales}</div>
                        <div class="usuario-details">
                            <h4>${usuario.name || usuario.nombre}</h4>
                            <p>ID: ${usuario.id}</p>
                        </div>
                    </div>
                </td>
                <td>${usuario.email}</td>
                <td>
                    <span class="rol-badge rol-${usuario.rol}">${usuario.rol.replace('_', ' ')}</span>
                </td>
                <td>
                    <span class="estado-badge estado-${usuario.activo ? 'activo' : 'inactivo'}">
                        ${usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>${this.formatearFecha(usuario.createdAt || usuario.fechaCreacion)}</td>
                <td>
                    <div class="acciones-usuario">
                        <button class="btn-accion btn-editar" onclick="superAdmin.abrirModalEditarUsuario('${usuario.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-accion btn-toggle" onclick="superAdmin.toggleEstadoUsuario('${usuario.id}')" title="Cambiar Estado">
                            <i class="fas fa-toggle-on"></i>
                        </button>
                        ${usuario.rol !== 'super_usuario' ? `
                            <button class="btn-accion btn-eliminar" onclick="superAdmin.eliminarUsuario('${usuario.id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    filtrarUsuarios() {
        const busqueda = document.getElementById('buscarUsuario').value.toLowerCase();
        const rol = document.getElementById('filtroRol').value;
        const estado = document.getElementById('filtroEstado').value;

        const usuariosFiltrados = this.usuarios.filter(usuario => {
            const coincideBusqueda = usuario.name.toLowerCase().includes(busqueda) ||
                                   usuario.email.toLowerCase().includes(busqueda);
            const coincideRol = !rol || usuario.rol === rol;
            const coincideEstado = !estado || (estado === 'activo' ? usuario.activo : !usuario.activo);

            return coincideBusqueda && coincideRol && coincideEstado;
        });

        this.mostrarUsuariosFiltrados(usuariosFiltrados);
    }

    mostrarUsuariosFiltrados(usuarios) {
        const tbody = document.getElementById('usuariosTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        usuarios.forEach(usuario => {
            const row = document.createElement('tr');
            const iniciales = usuario.name.split(' ').map(n => n[0]).join('').toUpperCase();
            
            row.innerHTML = `
                <td>
                    <div class="usuario-info">
                        <div class="usuario-avatar">${iniciales}</div>
                        <div class="usuario-details">
                            <h4>${usuario.name}</h4>
                            <p>ID: ${usuario.id}</p>
                        </div>
                    </div>
                </td>
                <td>${usuario.email}</td>
                <td>
                    <span class="rol-badge rol-${usuario.rol}">${usuario.rol.replace('_', ' ')}</span>
                </td>
                <td>
                    <span class="estado-badge estado-${usuario.activo ? 'activo' : 'inactivo'}">
                        ${usuario.activo ? 'Activo' : 'Inactivo'}
                    </span>
                </td>
                <td>${new Date(usuario.createdAt).toLocaleDateString()}</td>
                <td>
                    <div class="acciones-usuario">
                        <button class="btn-accion btn-editar" onclick="superAdmin.abrirModalEditarUsuario('${usuario.id}')" title="Editar">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn-accion btn-toggle" onclick="superAdmin.toggleEstadoUsuario('${usuario.id}')" title="Cambiar Estado">
                            <i class="fas fa-toggle-on"></i>
                        </button>
                        ${usuario.rol !== 'super_usuario' ? `
                            <button class="btn-accion btn-eliminar" onclick="superAdmin.eliminarUsuario('${usuario.id}')" title="Eliminar">
                                <i class="fas fa-trash"></i>
                            </button>
                        ` : ''}
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    async cargarProductos() {
        const tbody = document.getElementById('productosGlobalesTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        this.productos.forEach(producto => {
            const vendedor = this.usuarios.find(u => u.id === producto.vendedorId);
            const nombreVendedor = vendedor ? (vendedor.name || vendedor.nombre) : 'Desconocido';
            
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
                    <div class="producto-vendedor">${nombreVendedor}</div>
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
                        <button class="btn-accion btn-editar" onclick="superAdmin.verDetallesProducto('${producto.id}')" title="Ver Detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    cargarVendedoresEnFiltro() {
        const select = document.getElementById('filtroVendedor');
        if (!select) return;

        // Limpiar opciones existentes excepto la primera
        select.innerHTML = '<option value="">Todos los vendedores</option>';

        // Obtener vendedores únicos
        const vendedores = [...new Set(this.productos.map(p => p.vendedorId))];
        
        vendedores.forEach(vendedorId => {
            const vendedor = this.usuarios.find(u => u.id === vendedorId);
            if (vendedor) {
                const option = document.createElement('option');
                option.value = vendedorId;
                option.textContent = vendedor.name;
                select.appendChild(option);
            }
        });
    }

    filtrarProductosGlobales() {
        const busqueda = document.getElementById('buscarProductoGlobal').value.toLowerCase();
        const vendedor = document.getElementById('filtroVendedor').value;
        const categoria = document.getElementById('filtroCategoriaGlobal').value;

        const productosFiltrados = this.productos.filter(producto => {
            const coincideBusqueda = producto.nombre.toLowerCase().includes(busqueda) ||
                                   producto.descripcion.toLowerCase().includes(busqueda);
            const coincideVendedor = !vendedor || producto.vendedorId === vendedor;
            const coincideCategoria = !categoria || producto.categoria === categoria;

            return coincideBusqueda && coincideVendedor && coincideCategoria;
        });

        this.mostrarProductosFiltrados(productosFiltrados);
    }

    mostrarProductosFiltrados(productos) {
        const tbody = document.getElementById('productosGlobalesTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        productos.forEach(producto => {
            const vendedor = this.usuarios.find(u => u.id === producto.vendedorId);
            const nombreVendedor = vendedor ? vendedor.name : 'Desconocido';
            
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
                    <div class="producto-vendedor">${nombreVendedor}</div>
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
                        <button class="btn-accion btn-editar" onclick="superAdmin.verDetallesProducto('${producto.id}')" title="Ver Detalles">
                            <i class="fas fa-eye"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    abrirModalVendedor() {
        const modal = document.getElementById('modalVendedor');
        const form = document.getElementById('formVendedor');
        form.reset();
        modal.classList.add('active');
    }

    cerrarModalVendedor() {
        const modal = document.getElementById('modalVendedor');
        modal.classList.remove('active');
    }

    abrirModalCliente() {
        const modal = document.getElementById('modalCliente');
        const form = document.getElementById('formCliente');
        form.reset();
        modal.classList.add('active');
    }

    cerrarModalCliente() {
        const modal = document.getElementById('modalCliente');
        modal.classList.remove('active');
    }

    abrirModalEditarUsuario(usuarioId) {
        const modal = document.getElementById('modalEditarUsuario');
        const titulo = document.getElementById('modalEditarUsuarioTitulo');
        const form = document.getElementById('formEditarUsuario');

        this.usuarioEditando = this.usuarios.find(u => u.id === usuarioId);
        titulo.textContent = `Editar ${this.usuarioEditando.name}`;
        this.llenarFormularioEditarUsuario(this.usuarioEditando);
        modal.classList.add('active');
    }

    cerrarModalEditarUsuario() {
        const modal = document.getElementById('modalEditarUsuario');
        modal.classList.remove('active');
        this.usuarioEditando = null;
    }

    llenarFormularioEditarUsuario(usuario) {
        document.getElementById('editarUsuarioNombre').value = usuario.name;
        document.getElementById('editarUsuarioEmail').value = usuario.email;
        document.getElementById('editarUsuarioTelefono').value = usuario.phone;
        document.getElementById('editarUsuarioRol').value = usuario.rol;
        document.getElementById('editarUsuarioPassword').value = '';
        document.getElementById('editarUsuarioEstado').value = usuario.activo ? 'activo' : 'inactivo';
    }

    guardarVendedor() {
        const formData = new FormData(document.getElementById('formVendedor'));
        
        const vendedor = {
            id: 'user_' + Date.now(),
            name: formData.get('nombre'),
            email: formData.get('email'),
            phone: formData.get('telefono'),
            password: formData.get('password'),
            rol: 'vendedor',
            activo: true,
            permisos: ['gestion_mis_productos', 'ver_mis_ventas', 'ver_mis_estadisticas'],
            creadoPor: this.currentUser.id,
            createdAt: new Date().toISOString(),
            carrito: [],
            favoritos: []
        };

        // Verificar si el email ya existe
        if (this.usuarios.find(u => u.email === vendedor.email)) {
            this.mostrarMensaje('Ya existe un usuario con este email', 'error');
            return;
        }
        
        this.usuarios.push(vendedor);
        this.guardarUsuarios();
        this.cargarUsuarios();
        this.actualizarDashboard();
        this.cerrarModalVendedor();
        this.mostrarMensaje('Vendedor registrado correctamente', 'success');
    }

    guardarCliente() {
        const formData = new FormData(document.getElementById('formCliente'));
        
        const cliente = {
            id: 'user_' + Date.now(),
            name: formData.get('nombre'),
            email: formData.get('email'),
            phone: formData.get('telefono'),
            password: formData.get('password'),
            rol: 'cliente',
            activo: true,
            permisos: ['comprar', 'ver_productos'],
            creadoPor: this.currentUser.id,
            createdAt: new Date().toISOString(),
            carrito: [],
            favoritos: []
        };

        // Verificar si el email ya existe
        if (this.usuarios.find(u => u.email === cliente.email)) {
            this.mostrarMensaje('Ya existe un usuario con este email', 'error');
            return;
        }
        
        this.usuarios.push(cliente);
        this.guardarUsuarios();
        this.cargarUsuarios();
        this.actualizarDashboard();
        this.cerrarModalCliente();
        this.mostrarMensaje('Cliente registrado correctamente', 'success');
    }

    guardarEdicionUsuario() {
        const formData = new FormData(document.getElementById('formEditarUsuario'));
        
        const usuario = {
            id: this.usuarioEditando.id,
            name: formData.get('nombre'),
            email: formData.get('email'),
            phone: formData.get('telefono'),
            rol: formData.get('rol'),
            password: formData.get('password') || this.usuarioEditando.password,
            activo: formData.get('estado') === 'activo',
            permisos: this.obtenerPermisosPorRol(formData.get('rol')),
            creadoPor: this.usuarioEditando.creadoPor,
            createdAt: this.usuarioEditando.createdAt,
            carrito: this.usuarioEditando.carrito,
            favoritos: this.usuarioEditando.favoritos
        };

        // Verificar si el email ya existe (excluyendo el usuario actual)
        const emailExistente = this.usuarios.find(u => u.email === usuario.email && u.id !== usuario.id);
        if (emailExistente) {
            this.mostrarMensaje('Ya existe un usuario con este email', 'error');
            return;
        }
        
        const index = this.usuarios.findIndex(u => u.id === usuario.id);
        this.usuarios[index] = usuario;
        
        this.guardarUsuarios();
        this.cargarUsuarios();
        this.actualizarDashboard();
        this.cerrarModalEditarUsuario();
        this.mostrarMensaje('Usuario actualizado correctamente', 'success');
    }

    obtenerPermisosPorRol(rol) {
        const permisos = {
            'vendedor': ['gestion_mis_productos', 'ver_mis_ventas', 'ver_mis_estadisticas'],
            'cliente': ['comprar', 'ver_productos']
        };
        return permisos[rol] || [];
    }

    editarUsuario(usuarioId) {
        this.abrirModalUsuario(usuarioId);
    }

    toggleEstadoUsuario(usuarioId) {
        const usuario = this.usuarios.find(u => u.id === usuarioId);
        if (!usuario) return;

        usuario.activo = !usuario.activo;

        this.guardarUsuarios();
        this.cargarUsuarios();
        this.actualizarDashboard();
        
        this.mostrarMensaje(`Usuario ${usuario.activo ? 'activado' : 'desactivado'}`, 'info');
    }

    eliminarUsuario(usuarioId) {
        const usuario = this.usuarios.find(u => u.id === usuarioId);
        if (!usuario) return;

        // No permitir eliminar super usuarios
        if (usuario.rol === 'super_usuario') {
            this.mostrarMensaje('No se puede eliminar un super usuario', 'error');
            return;
        }

        this.mostrarConfirmacion(
            `¿Estás seguro de eliminar al usuario "${usuario.name}"?`,
            () => {
                this.usuarios = this.usuarios.filter(u => u.id !== usuarioId);
                this.guardarUsuarios();
                this.cargarUsuarios();
                this.actualizarDashboard();
                this.mostrarMensaje('Usuario eliminado correctamente', 'success');
            }
        );
    }

    verDetallesProducto(productoId) {
        const producto = this.productos.find(p => p.id === productoId);
        if (producto) {
            this.mostrarMensaje(`Producto: ${producto.nombre} - Vendedor: ${this.usuarios.find(u => u.id === producto.vendedorId)?.name || 'Desconocido'}`, 'info');
        }
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

    guardarUsuarios() {
        localStorage.setItem('pincelart_users', JSON.stringify(this.usuarios));
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
let superAdmin;

document.addEventListener('DOMContentLoaded', () => {
    superAdmin = new SuperAdminSystem();
});

function abrirModalVendedor() {
    superAdmin.abrirModalVendedor();
}

function cerrarModalVendedor() {
    superAdmin.cerrarModalVendedor();
}

function abrirModalCliente() {
    superAdmin.abrirModalCliente();
}

function cerrarModalCliente() {
    superAdmin.cerrarModalCliente();
}

function abrirModalEditarUsuario() {
    superAdmin.abrirModalEditarUsuario();
}

function cerrarModalEditarUsuario() {
    superAdmin.cerrarModalEditarUsuario();
}

function cerrarModalConfirmacion() {
    superAdmin.cerrarModalConfirmacion();
}

function irATienda() {
    window.location.href = 'main.html';
}

function cerrarSesionSuperAdmin() {
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
