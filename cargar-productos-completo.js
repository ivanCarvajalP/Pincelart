// Script para cargar TODOS tus 166 productos desde carpetas locales
// Ejecuta esto UNA VEZ para inicializar todo

function cargarTodosProductos() {
    console.log('🚀 Iniciando carga completa de 166 productos...');
    
    const productos = [];
    let contador = 0;
    
    // ACCESORIOS
    const categoriasAccesorios = {
        'AreteCollar': 'Aretes con Collar',
        'Aretes': 'Aretes Amazónicos',
        'Bolsos': 'Bolsos Amazónicos',
        'Chapas': 'Chapas Personalizadas',
        'Gorras': 'Gorras Amazónicas',
        'ImanNevera': 'Imanes de Nevera',
        'Monederos': 'Monederos Amazónicos',
        'Monias': 'Monías Artesanales',
        'Ponchos': 'Ponchos Amazónicos',
        'PortaCelulares': 'Porta Celulares',
        'Pulsera': 'Pulseras Amazónicas',
        'Sombreros': 'Sombreros Amazónicos'
    };
    
    // ROPA
    const categoriasRopa = {
        'BusosHombre': 'Buso Masculino',
        'BusosMujer': 'Buso Femenino',
        'ConjuntoAmazonico': 'Conjunto Amazónico',
        'Guayabera': 'Guayabera Amazónica'
    };
    
    // HOGAR
    const categoriasHogar = {
        'Cuadros': 'Cuadros Amazónicos',
        'Pocillos': 'Pocillos Amazónicos'
    };
    
    // Función para cargar productos de una categoría
    function cargarCategoria(tipo, categoria, nombreCategoria) {
        const rutas = [
            `images/productos/accesorios/${categoria}`,
            `images/productos/Ropa/${categoria}`,
            `images/productos/hogar/${categoria}`
        ];
        
        rutas.forEach(ruta => {
            const folder = ruta.includes(tipo) ? ruta : null;
            if (folder) {
                const files = []; // Se llenará con archivos reales
                
                // Simular carga de archivos (esto se hará con fetch real)
                for (let i = 1; i <= 50; i++) {
                    const imagenPath = `${folder}/${categoria.toLowerCase()}${i}.jpg`;
                    
                    contador++;
                    productos.push({
                        id: `${categoria.toLowerCase()}-${contador}`,
                        nombre: `${nombreCategoria} ${i}`,
                        descripcion: `${nombreCategoria} únicos con diseños amazónicos tradicionales. Artesanía auténtica colombiana.`,
                        categoria: tipo === 'accesorios' ? 'accesorios' : tipo === 'Ropa' ? 'ropa' : 'hogar',
                        precio: 25000,
                        stock: 1,
                        estado: 'activo',
                        imagen: imagenPath,
                        activo: true,
                        fechaCreacion: new Date().toISOString()
                    });
                }
            }
        });
    }
    
    // Cargar todas las categorías
    console.log('📦 Cargando accesorios...');
    Object.entries(categoriasAccesorios).forEach(([categoria, nombre]) => {
        cargarCategoria('accesorios', categoria, nombre);
    });
    
    console.log('👕 Cargando ropa...');
    Object.entries(categoriasRopa).forEach(([categoria, nombre]) => {
        cargarCategoria('Ropa', categoria, nombre);
    });
    
    console.log('🏠 Cargando hogar...');
    Object.entries(categoriasHogar).forEach(([categoria, nombre]) => {
        cargarCategoria('hogar', categoria, nombre);
    });
    
    console.log(`✅ Total: ${productos.length} productos generados`);
    
    // Guardar en localStorage
    localStorage.setItem('pincelart_productos', JSON.stringify(productos));
    console.log('💾 Productos guardados en localStorage');
    
    return productos;
}

// Ejecutar
window.cargarTodosProductos = cargarTodosProductos;

