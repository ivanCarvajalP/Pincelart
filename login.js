// Sistema de Login para PincelArt
class LoginSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('pincelart_users')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('pincelart_current_user')) || null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.checkExistingSession();
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
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        document.getElementById('registerForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        document.getElementById('forgotForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleForgotPassword();
        });

        // Validación de contraseñas en tiempo real
        document.getElementById('confirmPassword').addEventListener('input', () => {
            this.validatePasswordMatch();
        });

        // Prevenir envío accidental del formulario con Enter
        document.getElementById('registerForm').addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                // Solo enviar si todos los campos están llenos
                const name = document.getElementById('registerName').value;
                const email = document.getElementById('registerEmail').value;
                const phone = document.getElementById('registerPhone').value;
                const password = document.getElementById('registerPassword').value;
                const confirmPassword = document.getElementById('confirmPassword').value;
                const acceptTerms = document.getElementById('acceptTerms').checked;
                
                if (name && email && phone && password && confirmPassword && acceptTerms) {
                    this.handleRegister();
                } else {
                    this.showMessage('Por favor, completa todos los campos antes de enviar.', 'error');
                }
            }
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
        
        // Solo limpiar formularios si no hay datos importantes
        // No limpiar si el usuario está en medio de llenar un formulario
        if (formType === 'login') {
            // Solo limpiar el formulario de login si está vacío
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            if (!email && !password) {
                this.clearForms();
            }
        } else if (formType === 'register') {
            // No limpiar el formulario de registro automáticamente
            // Solo limpiar estilos de validación
            document.querySelectorAll('input').forEach(input => {
                input.style.borderColor = '#e0e0e0';
            });
        } else {
            // Para otros formularios, limpiar normalmente
            this.clearForms();
        }
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('pincelart_current_user', JSON.stringify(user));
            
            if (rememberMe) {
                localStorage.setItem('pincelart_remember_me', 'true');
            }

            this.showMessage('¡Bienvenido de vuelta!', 'success');
            
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 1500);
        } else {
            this.showMessage('Credenciales incorrectas. Inténtalo de nuevo.', 'error');
        }
    }

    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const phone = document.getElementById('registerPhone').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const acceptTerms = document.getElementById('acceptTerms').checked;

        // Validaciones
        if (!this.validateEmail(email)) {
            this.showMessage('Por favor, ingresa un correo electrónico válido.', 'error');
            return;
        }

        if (password.length < 6) {
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
            name: name,
            email: email,
            phone: phone,
            password: password,
            createdAt: new Date().toISOString(),
            carrito: [],
            favoritos: []
        };

        this.users.push(newUser);
        localStorage.setItem('pincelart_users', JSON.stringify(this.users));

        this.showMessage('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.', 'success');
        
        setTimeout(() => {
            this.showForm('login');
        }, 2000);
    }

    handleForgotPassword() {
        const email = document.getElementById('forgotEmail').value;

        if (!this.validateEmail(email)) {
            this.showMessage('Por favor, ingresa un correo electrónico válido.', 'error');
            return;
        }

        const user = this.users.find(u => u.email === email);

        if (user) {
            // En un sistema real, aquí enviarías un email
            this.showMessage(`Se ha enviado un código de recuperación a ${email}. Revisa tu correo electrónico.`, 'info');
        } else {
            this.showMessage('No se encontró una cuenta con este correo electrónico.', 'error');
        }
    }

    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validatePasswordMatch() {
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (confirmPassword && password !== confirmPassword) {
            document.getElementById('confirmPassword').style.borderColor = '#f44336';
        } else {
            document.getElementById('confirmPassword').style.borderColor = '#e0e0e0';
        }
    }

    showMessage(message, type) {
        const messageContainer = document.getElementById('message-container');
        messageContainer.textContent = message;
        messageContainer.className = `message-container ${type}`;
        
        setTimeout(() => {
            this.clearMessages();
        }, 5000);
    }

    clearMessages() {
        const messageContainer = document.getElementById('message-container');
        messageContainer.className = 'message-container';
        messageContainer.textContent = '';
    }

    clearForms() {
        document.querySelectorAll('form').forEach(form => {
            form.reset();
        });
        
        // Limpiar estilos de validación
        document.querySelectorAll('input').forEach(input => {
            input.style.borderColor = '#e0e0e0';
        });
    }

    checkExistingSession() {
        const rememberMe = localStorage.getItem('pincelart_remember_me');
        
        if (rememberMe === 'true' && this.currentUser) {
            // Usuario ya logueado, redirigir directamente
            this.showMessage('Ya tienes una sesión activa. Redirigiendo...', 'info');
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 2000);
        }
    }

    // Métodos para manejar datos del usuario
    getUserData() {
        return this.currentUser;
    }

    updateUserData(userData) {
        if (this.currentUser) {
            const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
            if (userIndex !== -1) {
                this.users[userIndex] = { ...this.users[userIndex], ...userData };
                this.currentUser = this.users[userIndex];
                localStorage.setItem('pincelart_users', JSON.stringify(this.users));
                localStorage.setItem('pincelart_current_user', JSON.stringify(this.currentUser));
            }
        }
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('pincelart_current_user');
        localStorage.removeItem('pincelart_remember_me');
        window.location.href = 'main.html';
    }
}

// Inicializar el sistema de login cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    new LoginSystem();
});

// Función global para logout (disponible en toda la aplicación)
function logout() {
    const loginSystem = new LoginSystem();
    loginSystem.logout();
}

// Función para obtener datos del usuario actual
function getCurrentUser() {
    return JSON.parse(localStorage.getItem('pincelart_current_user'));
}

// Función para actualizar carrito del usuario
function updateUserCart(carrito) {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const loginSystem = new LoginSystem();
        loginSystem.updateUserData({ carrito: carrito });
    }
}

// Función para actualizar favoritos del usuario
function updateUserFavorites(favoritos) {
    const currentUser = getCurrentUser();
    if (currentUser) {
        const loginSystem = new LoginSystem();
        loginSystem.updateUserData({ favoritos: favoritos });
    }
}
