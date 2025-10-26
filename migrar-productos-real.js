// MIGRAR 166 PRODUCTOS REALES - EJECUTAR UNA SOLA VEZ
// Este script carga todos tus 166 productos con sus imágenes reales

const productos = [];

// Función para crear producto
function crearProducto(id, nombre, descripcion, categoria, precio, stock, imagen) {
    return {
        id,
        nombre,
        descripcion,
        categoria,
        precio,
        stock,
        estado: 'activo',
        imagen,
        activo: true,
        fechaCreacion: new Date().toISOString()
    };
}

let contador = 0;

// ACCESORIOS - Aretes Collar
for (let i = 1; i <= 4; i++) {
    productos.push(crearProducto(
        `arete-collar-${i}`,
        `Arete Collar Amazónico ${i}`,
        'Combinación única de arete y collar con diseños amazónicos',
        'accesorios',
        45000,
        1,
        `images/productos/accesorios/AreteCollar/areteCollar${i}.jpg`
    ));
}

// ACCESORIOS - Aretes
for (let i = 1; i <= 38; i++) {
    productos.push(crearProducto(
        `arete-${i}`,
        `Aretes Amazónicos ${i}`,
        'Aretes únicos con diseños amazónicos tradicionales',
        'accesorios',
        25000,
        1,
        `images/productos/accesorios/Aretes/arete${i}.jpg`
    ));
}

// ACCESORIOS - Bolsos
for (let i = 1; i <= 11; i++) {
    productos.push(crearProducto(
        `bolso-${i}`,
        `Bolso Amazónico ${i}`,
        'Bolsos artesanales con diseños amazónicos',
        'accesorios',
        85000,
        1,
        `images/productos/accesorios/Bolsos/bolso${i}.jpg`
    ));
}

// ACCESORIOS - Chapas
for (let i = 1; i <= 10; i++) {
    productos.push(crearProducto(
        `chapa-${i}`,
        `Chapa Personalizada ${i}`,
        'Chapas con diseños amazónicos únicos',
        'accesorios',
        15000,
        1,
        `images/productos/accesorios/Chapas/chapa${i}.jpg`
    ));
}

// ACCESORIOS - Gorras
for (let i = 1; i <= 41; i++) {
    productos.push(crearProducto(
        `gorra-${i}`,
        `Gorra Amazónica ${i}`,
        'Gorras con diseños de la Amazonía colombiana',
        'accesorios',
        55000,
        1,
        `images/productos/accesorios/Gorras/gorra${i}.jpg`
    ));
}

// ACCESORIOS - Imanes Nevera
for (let i = 1; i <= 3; i++) {
    productos.push(crearProducto(
        `iman-nevera-${i}`,
        `Iman de Nevera ${i}`,
        'Imanes decorativos con motivos amazónicos',
        'accesorios',
        12000,
        1,
        `images/productos/accesorios/ImanNevera/imanNevera${i}.jpg`
    ));
}

// ACCESORIOS - Monederos
for (let i = 1; i <= 5; i++) {
    productos.push(crearProducto(
        `monedero-${i}`,
        `Monedero Amazónico ${i}`,
        'Monederos artesanales con diseños amazónicos',
        'accesorios',
        35000,
        1,
        `images/productos/accesorios/Monederos/monedero${i}.jpg`
    ));
}

// ACCESORIOS - Monías
for (let i = 1; i <= 2; i++) {
    productos.push(crearProducto(
        `monia-${i}`,
        `Monía Artesanal ${i}`,
        'Monías con diseños tradicionales amazónicos',
        'accesorios',
        28000,
        1,
        `images/productos/accesorios/Monias/monia${i}.jpg`
    ));
}

// ACCESORIOS - Ponchos
for (let i = 1; i <= 8; i++) {
    productos.push(crearProducto(
        `poncho-${i}`,
        `Poncho Amazónico ${i}`,
        'Ponchos artesanales tradicionales de la Amazonía',
        'accesorios',
        120000,
        1,
        `images/productos/accesorios/Ponchos/poncho${i}.jpg`
    ));
}

// ACCESORIOS - Porta Celulares
for (let i = 1; i <= 6; i++) {
    productos.push(crearProducto(
        `porta-celular-${i}`,
        `Porta Celular Amazónico ${i}`,
        'Porta celulares con diseños amazónicos únicos',
        'accesorios',
        25000,
        1,
        `images/productos/accesorios/PortaCelulares/portaCelular${i}.jpg`
    ));
}

// ACCESORIOS - Pulseras
productos.push(crearProducto(
    'pulsera-1',
    'Pulsera Amazónica',
    'Pulseras artesanales con diseños tradicionales',
    'accesorios',
    30000,
    1,
    'images/productos/accesorios/Pulsera/pulsera1.jpg'
));

// ACCESORIOS - Sombreros
for (let i = 1; i <= 4; i++) {
    productos.push(crearProducto(
        `sombrero-${i}`,
        `Sombrero Amazónico ${i}`,
        'Sombreros tradicionales de la Amazonía',
        'accesorios',
        45000,
        1,
        `images/productos/accesorios/Sombreros/sombrero${i}.jpg`
    ));
}

// HOGAR - Cuadros
for (let i = 1; i <= 3; i++) {
    productos.push(crearProducto(
        `cuadro-${i}`,
        `Cuadro Paisaje Amazónico ${i}`,
        'Arte amazónico para tu hogar. Paisajes y cultura en cada obra',
        'hogar',
        120000,
        1,
        `images/productos/hogar/Cuadros/cuadro${i}.jpg`
    ));
}

// HOGAR - Pocillos
for (let i = 1; i <= 4; i++) {
    productos.push(crearProducto(
        `pocillo-${i}`,
        `Pocillo Amazónico ${i}`,
        'Pocillos únicos con diseños amazónicos tradicionales',
        'hogar',
        18000,
        1,
        `images/productos/hogar/Pocillos/pocillo${i}.jpg`
    ));
}

// ROPA - Busos Hombre
for (let i = 1; i <= 10; i++) {
    productos.push(crearProducto(
        `buso-hombre-${i}`,
        `Buso Deportivo Masculino ${i}`,
        'Comodidad y estilo con diseños únicos de la Amazonía. Ideales para el día a día',
        'ropa',
        35000,
        1,
        `images/productos/Ropa/BusosHombre/busoMas${i}.jpg`
    ));
}

// ROPA - Busos Mujer
productos.push(crearProducto(
    'bluson-fem-1',
    'Blusón Femenino Amazónico',
    'Prendas cómodas con diseños amazónicos únicos',
    'ropa',
    40000,
    1,
    'images/productos/Ropa/BusosMujer/blusonFem1.jpg'
));

for (let i = 1; i <= 8; i++) {
    productos.push(crearProducto(
        `buso-mujer-${i}`,
        `Buso Deportivo Femenino ${i}`,
        'Comodidad y estilo con diseños únicos de la Amazonía. Ideales para el día a día',
        'ropa',
        35000,
        1,
        `images/productos/Ropa/BusosMujer/busoFem${i}.jpg`
    ));
}

// ROPA - Conjunto Amazónico
for (let i = 1; i <= 2; i++) {
    productos.push(crearProducto(
        `conjunto-amazonico-${i}`,
        `Conjunto Amazónico ${i}`,
        'Set completo tradicional con camisa y pantalón. Autenticidad amazónica en cada pieza',
        'ropa',
        120000,
        1,
        `images/productos/Ropa/ConjuntoAmazonico/conjuntoAmazonicoFem${i}.jpg`
    ));
}

// ROPA - Guayabera
for (let i = 1; i <= 5; i++) {
    productos.push(crearProducto(
        `guayabera-fem-${i}`,
        `Guayabera Amazónica Femenina ${i}`,
        'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales',
        'ropa',
        65000,
        1,
        `images/productos/Ropa/Guayabera/guayaberaFem${i}.jpg`
    ));
}

productos.push(crearProducto(
    'guayabera-mas-1',
    'Guayabera Amazónica Masculina',
    'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales',
    'ropa',
    65000,
    1,
    'images/productos/Ropa/Guayabera/guayaberaMas1.jpg'
));

console.log(`✅ Total productos creados: ${productos.length}`);

// Guardar en localStorage
localStorage.setItem('pincelart_productos', JSON.stringify(productos));

// Intentar guardar en Firebase (si está disponible)
async function subirAFirebase() {
    if (window.firebaseService && window.firebaseService.initialized) {
        console.log('🔥 Subiendo productos a Firebase...');
        for (const producto of productos) {
            try {
                await window.firebaseService.saveProduct(producto);
                console.log(`✅ ${producto.nombre} guardado en Firebase`);
            } catch (error) {
                console.warn(`⚠️ ${producto.nombre} no se pudo subir:`, error);
            }
        }
        console.log('✅ Migración completada');
    }
}

// Ejecutar
console.log('📦 Productos migrados a localStorage');
subirAFirebase();

