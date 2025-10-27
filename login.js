// Sistema de Login para PincelArt - Versión Original Verde
class LoginSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('pincelart_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('pincelart_current_user')) || null;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.checkExistingSession();
        // Esperar a que se carguen usuarios de Firebase antes de crear admin
        await this.loadUsersFromFirebase();
        await this.createDefaultAdmin();
    }

    setupEventListeners() {
        // Cambiar entre formularios
        document.getElementById('showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('register');
        });

        document.getElementById('showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });

        document.getElementById('forgotPasswordLink').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('forgot');
        });

        document.getElementById('backToLogin').addEventListener('click', (e) => {
            e.preventDefault();
            this.showForm('login');
        });

        // Envío de formularios
        document.getElementById('loginForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleLogin();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        document.getElementById('forgotForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleForgotPassword();
        });
    }

    showForm(formType) {
        // Ocultar todos los formularios
        document.querySelectorAll('.form-container').forEach(form => {
            form.classList.remove('active');
        });

        // Mostrar el formulario seleccionado
        document.getElementById(`${formType}-form`).classList.add('active');
        
        // Limpiar mensajes
        this.clearMessages();
    }

    clearMessages() {
        const messageArea = document.getElementById('messageArea');
        messageArea.innerHTML = '';
    }

    showMessage(message, type = 'info') {
        const messageArea = document.getElementById('messageArea');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        messageArea.appendChild(messageDiv);

        // Auto-remover mensaje después de 5 segundos
        setTimeout(() => {
            if (messageDiv.parentNode) {
                messageDiv.parentNode.removeChild(messageDiv);
            }
        }, 5000);
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePassword(password) {
        return password.length >= 6;
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            this.showMessage('Por favor, completa todos los campos.', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showMessage('Por favor, ingresa un correo electrónico válido.', 'error');
            return;
        }

        // RECARGAR USUARIOS desde Firebase antes de buscar (para tener datos actualizados)
        console.log('🔄 Recargando usuarios desde Firebase antes de login...');
        await this.loadUsersFromFirebase();
        console.log(`📋 Usuarios disponibles para login: ${this.users.length}`);

        const user = this.users.find(u => u.email === email && u.password === password);
        
        if (user) {
            this.currentUser = user;
            localStorage.setItem('pincelart_current_user', JSON.stringify(user));
            
            console.log('🔐 Usuario logueado:', user.nombre, 'Rol:', user.rol);
            
            this.showMessage('¡Inicio de sesión exitoso! Redirigiendo...', 'success');
            
            setTimeout(() => {
                console.log('🚀 Redirigiendo a main.html...');
                // TODOS van a main.html (incluidos administradores)
                // El botón de administrador rojo en main.html será para entrar al panel
                window.location.href = 'main.html';
            }, 1500);
        } else {
            this.showMessage('Credenciales incorrectas. Verifica tu email y contraseña.', 'error');
        }
    }

    handleRegister() {
        const name = document.getElementById('registerName').value.trim();
        const email = document.getElementById('registerEmail').value.trim();
        const phone = document.getElementById('registerPhone').value.trim();
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const acceptTerms = document.getElementById('acceptTerms').checked;

        // Validaciones
        if (!name || !email || !phone || !password || !confirmPassword) {
            this.showMessage('Por favor, completa todos los campos.', 'error');
            return;
        }

        if (!this.validateEmail(email)) {
            this.showMessage('Por favor, ingresa un correo electrónico válido.', 'error');
            return;
        }

        if (!this.validatePassword(password)) {
            this.showMessage('La contraseña debe tener al menos 6 caracteres.', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showMessage('Las contraseñas no coinciden.', 'error');
            return;
        }

        if (!acceptTerms) {
            this.showMessage('Debes aceptar los términos y condiciones.', 'error');
            return;
        }

        // Verificar si el usuario ya existe
        if (this.users.find(u => u.email === email)) {
            this.showMessage('Ya existe una cuenta con este correo electrónico.', 'error');
            return;
        }

        // Crear nuevo usuario
        const newUser = {
            id: Date.now().toString(),
            nombre: name,
            email: email,
            telefono: phone,
            password: password,
            rol: 'cliente',
            fechaRegistro: new Date().toISOString(),
            carrito: [],
            favoritos: []
        };

        this.users.push(newUser);
        localStorage.setItem('pincelart_users', JSON.stringify(this.users));
        
        // Guardar en Firebase si está disponible
        if (window.firebaseService && window.firebaseService.initialized) {
            try {
                window.firebaseService.saveUser(newUser);
                console.log('✅ Usuario cliente guardado en Firebase:', newUser.email);
            } catch (error) {
                console.error('❌ Error guardando usuario en Firebase:', error);
            }
        }

        this.showMessage('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', 'success');
        
        setTimeout(() => {
            this.showForm('login');
        }, 2000);
    }

    async loadUsersFromFirebase() {
        // Esperar a que Firebase esté disponible (hasta 5 segundos)
        let attempts = 0;
        while (attempts < 10) {
            if (window.firebaseService && window.firebaseService.initialized) {
                try {
                    const result = await window.firebaseService.getAllUsers();
                    if (result.success) {
                        this.users = result.data;
                        localStorage.setItem('pincelart_users', JSON.stringify(this.users));
                        console.log('✅ Usuarios cargados desde Firebase:', this.users.length);
                        return; // Éxito, salir del bucle
                    }
                } catch (error) {
                    console.error('❌ Error cargando usuarios de Firebase:', error);
                }
            } else {
                // Esperar 500ms antes de intentar de nuevo
                await new Promise(resolve => setTimeout(resolve, 500));
                attempts++;
                console.log('⏳ Esperando que Firebase se inicialice...', attempts);
            }
        }
        console.warn('⚠️ No se pudieron cargar usuarios de Firebase, usando localStorage');
    }

    async handleForgotPassword() {
        const email = document.getElementById('forgotEmail').value.trim();

        if (!this.validateEmail(email)) {
            this.showMessage('Por favor, ingresa un correo electrónico válido.', 'error');
            return;
        }

        // Recargar usuarios desde Firebase antes de buscar
        await this.loadUsersFromFirebase();

        const user = this.users.find(u => u.email === email);
        
        if (user) {
            this.showMessage('Se han enviado las instrucciones de recuperación a tu correo.', 'success');
        } else {
            this.showMessage('No se encontró una cuenta con este correo electrónico.', 'error');
        }
    }

    checkExistingSession() {
        // Si ya hay sesión activa, redirigir a main.html
        if (this.currentUser && this.currentUser.nombre) {
            window.location.href = 'main.html';
        }
    }

    async createDefaultAdmin() {
        const adminExists = this.users.find(u => u.email === 'pivancarvajal@gmail.com');
        
        if (!adminExists) {
            const adminUser = {
                id: 'admin_001',
                name: 'Ivan Dario Carvajal Reina',
                nombre: 'Ivan Dario Carvajal Reina',
                email: 'pivancarvajal@gmail.com',
                phone: '3000000000',
                telefono: '3000000000',
                password: 'super123',
                rol: 'super_usuario',
                permisos: ['*'],
                fechaRegistro: new Date().toISOString(),
                carrito: [],
                favoritos: []
            };

            this.users.push(adminUser);
            localStorage.setItem('pincelart_users', JSON.stringify(this.users));
            
            // Guardar en Firebase si está disponible
            if (window.firebaseService && window.firebaseService.initialized) {
                try {
                    await window.firebaseService.saveUser(adminUser);
                    console.log('✅ Super usuario guardado en Firebase');
                } catch (error) {
                    console.error('❌ Error guardando super usuario en Firebase:', error);
                }
            }
        }
    }
}

// Función global para mostrar términos
function mostrarTerminos() {
    alert(`TÉRMINOS Y CONDICIONES DE PINCELART

1. ACEPTACIÓN DE TÉRMINOS
Al usar nuestros servicios, aceptas estos términos y condiciones.

2. USO DEL SERVICIO
- Debes ser mayor de 18 años o tener autorización parental
- No puedes usar el servicio para actividades ilegales
- Debes proporcionar información veraz y actualizada

3. PRODUCTOS Y SERVICIOS
- Los productos son personalizados según especificaciones
- Los tiempos de entrega pueden variar
- Se respeta la propiedad intelectual

4. PRIVACIDAD
- Respetamos tu privacidad según nuestra política
- No compartimos información personal con terceros
- Puedes solicitar eliminación de datos

5. MODIFICACIONES
Nos reservamos el derecho de modificar estos términos.

Para más información, contacta: info@pincelart.com`);
}

// Inicializar el sistema cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.loginSystem = new LoginSystem();
});