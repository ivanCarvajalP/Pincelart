# Punto de Control: Sistema de Roles y Permisos

## Fecha: 3 de Enero 2025

## Cambios Realizados:

### 1. Eliminación de Secciones no Funcionales
- Eliminadas completamente las secciones "Reportes y Estadísticas" y "Configuración del Sistema" del HTML
- Improvisaciones quedaron fuera

### 2. Configuración de Roles y Permisos
- **Administrador/Super Usuario**: Ven Gestión de Usuarios y Gestión de Productos
- **Dueño**: Ven Gestión de Usuarios y Gestión de Productos
  - Pueden gestionar usuarios pero NO pueden editar/eliminar administradores
  - NO pueden crear usuarios con rol de administrador (opción oculta en options)
- **Vendedor**: Solo ven Gestión de Productos

### 3. Botones de Acceso según Rol
- Administrador: Botón rojo "Administrador"
- Dueño: Botón morado "Dueño"
- Vendedor: Botón verde "Vendedor"

### 4. Actualización de Imagen en Sección Conócenos
- Cambiada la imagen de `images/FondoPagina/FondoPaginaWeb.jpg` a `images/conocenos/conocenos.jpg`

### Archivos Modificados:
- `admin-panel.html` - Eliminadas secciones de Reportes y Configuración
- `admin-panel-simple.js` - Lógica de permisos por rol y restricciones para dueño
- `script.js` - Botones personalizados según rol
- `main.html` - Actualización de imagen en Conócenos

### Funcionalidad Actual:
- Cada rol ve solo las secciones permitidas
- Dueño tiene restricciones para no modificar/eliminar administradores
- Dueño no puede crear usuarios administradores
- Sistema limpio sin secciones sin funcionalidad

