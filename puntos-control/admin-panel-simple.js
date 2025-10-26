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

// Funciones para gestión de productos
function mostrarGestionProductos() {
    console.log('🔄 Mostrando gestión de productos...');
    
    // Crear modal con lista de productos
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
    
    // Obtener productos desde Firebase o localStorage
    let productos = [];
    if (window.firebaseService && window.firebaseService.initialized) {
        window.firebaseService.getAllProducts().then(result => {
            if (result.success) {
                productos = result.data;
                actualizarListaProductos(modal, productos);
            }
        });
    } else {
        productos = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
    }
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 1000px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: #1976d2;">Gestión de Productos</h3>
                <button onclick="this.parentElement.parentElement.parentElement.remove()" style="padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">Cerrar</button>
            </div>
            <div id="lista-productos">
                <p>Cargando productos...</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Cargar productos inmediatamente
    setTimeout(() => {
        actualizarListaProductos(modal, productos);
    }, 100);
}

function actualizarListaProductos(modal, productos) {
    const listaProductos = modal.querySelector('#lista-productos');
    
    if (productos.length === 0) {
        listaProductos.innerHTML = '<p>No hay productos disponibles.</p>';
        return;
    }
    
    let html = '<div style="display: grid; gap: 1rem;">';
    productos.forEach(producto => {
        html += `
            <div style="border: 1px solid #e0e0e0; border-radius: 10px; padding: 1rem; display: flex; align-items: center; gap: 1rem;">
                <img src="${producto.imagen}" alt="${producto.nombre}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 0.5rem 0; color: #333;">${producto.nombre}</h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">${producto.descripcion}</p>
                    <div style="margin-top: 0.5rem; display: flex; gap: 1rem; font-size: 0.8rem;">
                        <span style="background: #e3f2fd; padding: 0.2rem 0.5rem; border-radius: 12px;">${producto.categoria}</span>
                        <span style="color: #1976d2; font-weight: 600;">$${producto.precio.toLocaleString()}</span>
                        <span style="color: #666;">Stock: ${producto.stock}</span>
                    </div>
                </div>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="editarProducto('${producto.id}')" style="padding: 0.3rem 0.8rem; background: #ff9800; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">Editar</button>
                    <button onclick="eliminarProducto('${producto.id}')" style="padding: 0.3rem 0.8rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">Eliminar</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    listaProductos.innerHTML = html;
}

function mostrarCrearProducto() {
    console.log('🔄 Mostrando crear producto...');
    
    // Crear modal simple
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
        <div style="background: white; padding: 2rem; border-radius: 10px; max-width: 600px; width: 90%;">
            <h3>Crear Nuevo Producto</h3>
            <p>Esta funcionalidad está en desarrollo.</p>
            <button onclick="this.parentElement.parentElement.remove()" style="padding: 0.5rem 1rem; background: #1976d2; color: white; border: none; border-radius: 5px; cursor: pointer;">Cerrar</button>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function mostrarGestionUsuarios() {
    console.log('🔄 Mostrando gestión de usuarios...');
    
    // Crear modal con lista de usuarios
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
    
    // Obtener usuarios desde localStorage
    const usuarios = JSON.parse(localStorage.getItem('pincelart_users')) || [];
    
    modal.innerHTML = `
        <div style="background: white; padding: 2rem; border-radius: 15px; max-width: 1000px; width: 95%; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 30px rgba(0,0,0,0.3);">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: #1976d2;">Gestión de Usuarios</h3>
                <div style="display: flex; gap: 0.5rem;">
                    <button onclick="actualizarListaUsuarios()" style="padding: 0.5rem 1rem; background: #4caf50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                        <i class="fas fa-sync-alt"></i> Actualizar
                    </button>
                    <button onclick="cerrarModalGestionUsuarios()" style="padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">Cerrar</button>
                </div>
            </div>
            <div id="lista-usuarios">
                ${generarListaUsuarios(usuarios)}
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
}

function generarListaUsuarios(usuarios) {
    if (usuarios.length === 0) {
        return '<p>No hay usuarios registrados.</p>';
    }
    
    let html = '<div style="display: grid; gap: 1rem;">';
    usuarios.forEach(usuario => {
        const rolColor = usuario.rol === 'super_usuario' ? '#f44336' : usuario.rol === 'administrador' ? '#ff9800' : '#4caf50';
        const rolTexto = usuario.rol === 'super_usuario' ? 'Super Usuario' : usuario.rol === 'administrador' ? 'Administrador' : 'Usuario';
        
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
                    <button onclick="editarUsuario('${usuario.id}')" style="padding: 0.3rem 0.8rem; background: #ff9800; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">Editar</button>
                    <button onclick="eliminarUsuario('${usuario.id}')" style="padding: 0.3rem 0.8rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 0.8rem;">Eliminar</button>
                </div>
            </div>
        `;
    });
    html += '</div>';
    
    return html;
}

function mostrarCrearUsuario() {
    console.log('🔄 Mostrando crear usuario...');
    
    // Crear modal con formulario
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
                <h3 style="margin: 0; color: #1976d2;">Crear Nuevo Usuario</h3>
                <button onclick="cerrarModalGestionUsuarios()" style="padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">Cerrar</button>
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
                        <option value="usuario">Usuario</option>
                        <option value="administrador">Administrador</option>
                        <option value="super_usuario">Super Usuario</option>
                    </select>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button type="submit" style="flex: 1; padding: 0.8rem; background: #4caf50; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Crear Usuario</button>
                    <button type="button" onclick="cerrarModalGestionUsuarios()" style="flex: 1; padding: 0.8rem; background: #f44336; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Cancelar</button>
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
    
    // Obtener usuarios existentes
    const usuarios = JSON.parse(localStorage.getItem('pincelart_users')) || [];
    
    // Verificar si el email ya existe
    if (usuarios.some(u => u.email === nuevoUsuario.email)) {
        mostrarMensaje('Error', 'Ya existe un usuario con este email.', 'error');
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
    
    // Cerrar el modal después de un delay
    setTimeout(() => {
        cerrarModalGestionUsuarios();
    }, 1500);
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
                <button onclick="cerrarModalGestionUsuarios()" style="padding: 0.5rem 1rem; background: #f44336; color: white; border: none; border-radius: 5px; cursor: pointer;">Cerrar</button>
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
                        <option value="usuario" ${usuario.rol === 'usuario' ? 'selected' : ''}>Usuario</option>
                        <option value="administrador" ${usuario.rol === 'administrador' ? 'selected' : ''}>Administrador</option>
                        <option value="super_usuario" ${usuario.rol === 'super_usuario' ? 'selected' : ''}>Super Usuario</option>
                    </select>
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <button type="submit" style="flex: 1; padding: 0.8rem; background: #4caf50; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Guardar Cambios</button>
                    <button type="button" onclick="cerrarModalGestionUsuarios()" style="flex: 1; padding: 0.8rem; background: #f44336; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">Cancelar</button>
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
    const formData = new FormData(form);
    
    const usuarios = JSON.parse(localStorage.getItem('pincelart_users')) || [];
    const usuarioIndex = usuarios.findIndex(u => u.id === usuarioId);
    
    if (usuarioIndex === -1) {
        mostrarMensaje('Error', 'Usuario no encontrado.', 'error');
        return;
    }
    
    // Verificar si el email ya existe en otro usuario
    const nuevoEmail = formData.get('email').trim();
    if (usuarios.some((u, index) => u.email === nuevoEmail && index !== usuarioIndex)) {
        mostrarMensaje('Error', 'Ya existe otro usuario con este email.', 'error');
        return;
    }
    
    // Actualizar usuario
    usuarios[usuarioIndex] = {
        ...usuarios[usuarioIndex],
        name: formData.get('nombre').trim(),
        email: nuevoEmail,
        phone: formData.get('telefono').trim(),
        rol: formData.get('rol'),
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
    
    // Cerrar el modal después de un delay
    setTimeout(() => {
        cerrarModalGestionUsuarios();
    }, 1500);
}

function eliminarUsuario(usuarioId) {
    const usuarios = JSON.parse(localStorage.getItem('pincelart_users')) || [];
    const usuario = usuarios.find(u => u.id === usuarioId);
    
    if (!usuario) {
        mostrarMensaje('Error', 'Usuario no encontrado.', 'error');
        return;
    }
    
    // Eliminar directamente sin confirmación
    const usuarioIndex = usuarios.findIndex(u => u.id === usuarioId);
    usuarios.splice(usuarioIndex, 1);
    localStorage.setItem('pincelart_users', JSON.stringify(usuarios));
    
    // Eliminar de Firebase si está disponible
    if (window.firebaseService && window.firebaseService.initialized) {
        window.firebaseService.deleteUser(usuarioId);
    }
    
    // Mostrar mensaje de éxito
    mostrarMensaje('¡Éxito!', 'Usuario eliminado exitosamente.', 'success');
    
    // Actualizar la lista de usuarios inmediatamente
    setTimeout(() => {
        actualizarListaUsuarios();
    }, 1000);
}

function actualizarListaUsuarios() {
    const usuarios = JSON.parse(localStorage.getItem('pincelart_users')) || [];
    const listaUsuarios = document.getElementById('lista-usuarios');
    
    if (listaUsuarios) {
        listaUsuarios.innerHTML = generarListaUsuarios(usuarios);
        console.log('✅ Lista de usuarios actualizada');
    } else {
        console.log('⚠️ No se encontró el elemento lista-usuarios');
    }
}

function cerrarModalGestionUsuarios() {
    // Cerrar todos los modales abiertos
    const modales = document.querySelectorAll('.modal');
    modales.forEach(modal => modal.remove());
    
    // Recargar la página después de un pequeño delay
    setTimeout(() => {
        window.location.reload();
    }, 100);
}
