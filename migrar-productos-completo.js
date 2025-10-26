// Script para migrar TODOS los productos locales a Firebase sin duplicados
// Ejecutar desde la consola del navegador en admin-panel.html

console.log('🚀 Iniciando migración completa de productos a Firebase...');

// Función para obtener todos los productos locales
function obtenerProductosLocales() {
    const productosLocales = [
        // ROPA - BUSOS HOMBRE
        {
            id: 'buso-mas-1',
            nombre: 'Buso Deportivo Masculino',
            descripcion: 'Comodidad y estilo con diseños únicos de la Amazonía. Ideales para el día a día.',
            categoria: 'ropa',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosHombre/busoMas1.jpg'
        },
        {
            id: 'buso-mas-2',
            nombre: 'Buso Deportivo Masculino',
            descripcion: 'Comodidad y estilo con diseños únicos de la Amazonía. Ideales para el día a día.',
            categoria: 'ropa',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosHombre/busoMas2.jpg'
        },
        {
            id: 'buso-mas-3',
            nombre: 'Buso Deportivo Masculino',
            descripcion: 'Comodidad y estilo con diseños únicos de la Amazonía. Ideales para el día a día.',
            categoria: 'ropa',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosHombre/busoMas3.jpg'
        },
        {
            id: 'buso-mas-4',
            nombre: 'Buso Deportivo Masculino',
            descripcion: 'Comodidad y estilo con diseños únicos de la Amazonía. Ideales para el día a día.',
            categoria: 'ropa',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosHombre/busoMas4.jpg'
        },
        {
            id: 'buso-mas-5',
            nombre: 'Buso Deportivo Masculino',
            descripcion: 'Comodidad y estilo con diseños únicos de la Amazonía. Ideales para el día a día.',
            categoria: 'ropa',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosHombre/busoMas5.jpg'
        },
        {
            id: 'buso-mas-6',
            nombre: 'Buso Deportivo Masculino',
            descripcion: 'Comodidad y estilo con diseños únicos de la Amazonía. Ideales para el día a día.',
            categoria: 'ropa',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosHombre/busoMas6.jpg'
        },
        {
            id: 'buso-mas-7',
            nombre: 'Buso Deportivo Masculino',
            descripcion: 'Comodidad y estilo con diseños únicos de la Amazonía. Ideales para el día a día.',
            categoria: 'ropa',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosHombre/busoMas7.jpg'
        },
        {
            id: 'buso-mas-8',
            nombre: 'Buso Deportivo Masculino',
            descripcion: 'Comodidad y estilo con diseños únicos de la Amazonía. Ideales para el día a día.',
            categoria: 'ropa',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosHombre/busoMas8.jpg'
        },
        {
            id: 'buso-mas-9',
            nombre: 'Buso Deportivo Masculino',
            descripcion: 'Comodidad y estilo con diseños únicos de la Amazonía. Ideales para el día a día.',
            categoria: 'ropa',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosHombre/busoMas9.jpg'
        },
        {
            id: 'buso-mas-10',
            nombre: 'Buso Deportivo Masculino',
            descripcion: 'Comodidad y estilo con diseños únicos de la Amazonía. Ideales para el día a día.',
            categoria: 'ropa',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosHombre/busoMas10.jpg'
        },

        // ROPA - BUSOS MUJER
        {
            id: 'buso-fem-1',
            nombre: 'Buso Deportivo Femenino',
            descripcion: 'Elegancia y comodidad para la mujer moderna. Diseños únicos amazónicos.',
            categoria: 'ropa',
            precio: 38000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosMujer/busoFem1.jpg'
        },
        {
            id: 'buso-fem-2',
            nombre: 'Buso Deportivo Femenino',
            descripcion: 'Elegancia y comodidad para la mujer moderna. Diseños únicos amazónicos.',
            categoria: 'ropa',
            precio: 38000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosMujer/busoFem2.jpg'
        },
        {
            id: 'buso-fem-3',
            nombre: 'Buso Deportivo Femenino',
            descripcion: 'Elegancia y comodidad para la mujer moderna. Diseños únicos amazónicos.',
            categoria: 'ropa',
            precio: 38000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosMujer/busoFem3.jpg'
        },
        {
            id: 'buso-fem-4',
            nombre: 'Buso Deportivo Femenino',
            descripcion: 'Elegancia y comodidad para la mujer moderna. Diseños únicos amazónicos.',
            categoria: 'ropa',
            precio: 38000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosMujer/busoFem4.jpg'
        },
        {
            id: 'buso-fem-5',
            nombre: 'Buso Deportivo Femenino',
            descripcion: 'Elegancia y comodidad para la mujer moderna. Diseños únicos amazónicos.',
            categoria: 'ropa',
            precio: 38000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosMujer/busoFem5.jpg'
        },
        {
            id: 'buso-fem-6',
            nombre: 'Buso Deportivo Femenino',
            descripcion: 'Elegancia y comodidad para la mujer moderna. Diseños únicos amazónicos.',
            categoria: 'ropa',
            precio: 38000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosMujer/busoFem6.jpg'
        },
        {
            id: 'buso-fem-7',
            nombre: 'Buso Deportivo Femenino',
            descripcion: 'Elegancia y comodidad para la mujer moderna. Diseños únicos amazónicos.',
            categoria: 'ropa',
            precio: 38000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosMujer/busoFem7.jpg'
        },
        {
            id: 'buso-fem-8',
            nombre: 'Buso Deportivo Femenino',
            descripcion: 'Elegancia y comodidad para la mujer moderna. Diseños únicos amazónicos.',
            categoria: 'ropa',
            precio: 38000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosMujer/busoFem8.jpg'
        },
        {
            id: 'bluson-fem-1',
            nombre: 'Blusón Femenino',
            descripcion: 'Blusón elegante con diseños amazónicos únicos.',
            categoria: 'ropa',
            precio: 42000,
            stock: 6,
            estado: 'activo',
            imagen: 'images/productos/Ropa/BusosMujer/blusonFem1.jpg'
        },

        // ROPA - CONJUNTO AMAZÓNICO
        {
            id: 'conjunto-amazonico-1',
            nombre: 'Conjunto Amazónico Femenino',
            descripcion: 'Conjunto elegante que combina tradición y modernidad amazónica.',
            categoria: 'ropa',
            precio: 85000,
            stock: 4,
            estado: 'activo',
            imagen: 'images/productos/Ropa/ConjuntoAmazonico/conjuntoAmazonicoFem1.jpg'
        },
        {
            id: 'conjunto-amazonico-2',
            nombre: 'Conjunto Amazónico Femenino',
            descripcion: 'Conjunto elegante que combina tradición y modernidad amazónica.',
            categoria: 'ropa',
            precio: 85000,
            stock: 4,
            estado: 'activo',
            imagen: 'images/productos/Ropa/ConjuntoAmazonico/conjuntoAmazonicoFem2.jpg'
        },

        // ROPA - GUAYABERAS
        {
            id: 'guayabera-fem-1',
            nombre: 'Guayabera Amazónica Femenina - Diseño Tropical',
            descripcion: 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales. Diseño único con motivos tropicales.',
            categoria: 'ropa',
            precio: 65000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/Guayabera/guayaberaFem1.jpg'
        },
        {
            id: 'guayabera-fem-2',
            nombre: 'Guayabera Amazónica Femenina - Estilo Clásico',
            descripcion: 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales. Estilo clásico con detalles finos.',
            categoria: 'ropa',
            precio: 65000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/Guayabera/guayaberaFem2.jpg'
        },
        {
            id: 'guayabera-fem-3',
            nombre: 'Guayabera Amazónica Femenina - Colores Vibrantes',
            descripcion: 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales. Con colores vibrantes amazónicos.',
            categoria: 'ropa',
            precio: 65000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/Guayabera/guayaberaFem3.jpg'
        },
        {
            id: 'guayabera-fem-4',
            nombre: 'Guayabera Amazónica Femenina - Estilo Moderno',
            descripcion: 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales. Diseño moderno con toque tradicional.',
            categoria: 'ropa',
            precio: 65000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/Guayabera/guayaberaFem4.jpg'
        },
        {
            id: 'guayabera-fem-5',
            nombre: 'Guayabera Amazónica Femenina - Línea Exclusiva',
            descripcion: 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales. Edición exclusiva limitada.',
            categoria: 'ropa',
            precio: 65000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/Guayabera/guayaberaFem5.jpg'
        },
        {
            id: 'guayabera-mas-1',
            nombre: 'Guayabera Amazónica Masculina - Estilo Clásico',
            descripcion: 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales. Diseño masculino elegante.',
            categoria: 'ropa',
            precio: 65000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/Ropa/Guayabera/guayaberaMas1.jpg'
        },

        // ACCESORIOS - ARETES
        {
            id: 'arete-1',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete1.jpg'
        },
        {
            id: 'arete-2',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete2.jpg'
        },
        {
            id: 'arete-3',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete3.jpg'
        },
        {
            id: 'arete-4',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete4.jpg'
        },
        {
            id: 'arete-5',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete5.jpg'
        },
        {
            id: 'arete-6',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete6.jpg'
        },
        {
            id: 'arete-7',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete7.jpg'
        },
        {
            id: 'arete-8',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete8.jpg'
        },
        {
            id: 'arete-9',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete9.jpg'
        },
        {
            id: 'arete-10',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete10.jpg'
        },
        {
            id: 'arete-11',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete11.jpg'
        },
        {
            id: 'arete-12',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete12.jpg'
        },
        {
            id: 'arete-13',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete13.jpg'
        },
        {
            id: 'arete-14',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete14.jpg'
        },
        {
            id: 'arete-15',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete15.jpg'
        },
        {
            id: 'arete-16',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete16.jpg'
        },
        {
            id: 'arete-17',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete17.jpg'
        },
        {
            id: 'arete-18',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete18.jpg'
        },
        {
            id: 'arete-19',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete19.jpg'
        },
        {
            id: 'arete-20',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete20.jpg'
        },
        {
            id: 'arete-21',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete21.jpg'
        },
        {
            id: 'arete-22',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete22.jpg'
        },
        {
            id: 'arete-23',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete23.jpg'
        },
        {
            id: 'arete-24',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete24.jpg'
        },
        {
            id: 'arete-25',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete25.jpg'
        },
        {
            id: 'arete-26',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete26.jpg'
        },
        {
            id: 'arete-27',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete27.jpg'
        },
        {
            id: 'arete-28',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete28.jpg'
        },
        {
            id: 'arete-29',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete29.jpg'
        },
        {
            id: 'arete-30',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete30.jpg'
        },
        {
            id: 'arete-31',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete31.jpg'
        },
        {
            id: 'arete-32',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete32.jpg'
        },
        {
            id: 'arete-33',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete33.jpg'
        },
        {
            id: 'arete-34',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete34.jpg'
        },
        {
            id: 'arete-35',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete35.jpg'
        },
        {
            id: 'arete-36',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete36.jpg'
        },
        {
            id: 'arete-37',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete37.jpg'
        },
        {
            id: 'arete-38',
            nombre: 'Aretes Amazónicos',
            descripcion: 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 25000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Aretes/arete38.jpg'
        },

        // ACCESORIOS - ARETES COLLAR
        {
            id: 'arete-collar-1',
            nombre: 'Arete Collar Amazónico',
            descripcion: 'Combinación única de arete y collar con diseños amazónicos.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/AreteCollar/areteCollar1.jpg'
        },
        {
            id: 'arete-collar-2',
            nombre: 'Arete Collar Amazónico',
            descripcion: 'Combinación única de arete y collar con diseños amazónicos.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/AreteCollar/areteCollar2.jpg'
        },
        {
            id: 'arete-collar-3',
            nombre: 'Arete Collar Amazónico',
            descripcion: 'Combinación única de arete y collar con diseños amazónicos.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/AreteCollar/areteCollar3.jpg'
        },
        {
            id: 'arete-collar-4',
            nombre: 'Arete Collar Amazónico',
            descripcion: 'Combinación única de arete y collar con diseños amazónicos.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/AreteCollar/areteCollar4.jpg'
        },

        // ACCESORIOS - BOLSOS
        {
            id: 'bolso-1',
            nombre: 'Bolso Amazónico',
            descripcion: 'Bolsos únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 55000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Bolsos/bolso1.jpg'
        },
        {
            id: 'bolso-2',
            nombre: 'Bolso Amazónico',
            descripcion: 'Bolsos únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 55000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Bolsos/bolso2.jpg'
        },
        {
            id: 'bolso-3',
            nombre: 'Bolso Amazónico',
            descripcion: 'Bolsos únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 55000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Bolsos/bolso3.jpg'
        },
        {
            id: 'bolso-4',
            nombre: 'Bolso Amazónico',
            descripcion: 'Bolsos únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 55000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Bolsos/bolso4.jpg'
        },
        {
            id: 'bolso-5',
            nombre: 'Bolso Amazónico',
            descripcion: 'Bolsos únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 55000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Bolsos/bolso5.jpg'
        },
        {
            id: 'bolso-6',
            nombre: 'Bolso Amazónico',
            descripcion: 'Bolsos únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 55000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Bolsos/bolso6.jpg'
        },
        {
            id: 'bolso-7',
            nombre: 'Bolso Amazónico',
            descripcion: 'Bolsos únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 55000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Bolsos/bolso7.jpg'
        },
        {
            id: 'bolso-8',
            nombre: 'Bolso Amazónico',
            descripcion: 'Bolsos únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 55000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Bolsos/bolso8.jpg'
        },
        {
            id: 'bolso-9',
            nombre: 'Bolso Amazónico',
            descripcion: 'Bolsos únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 55000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Bolsos/bolso9.jpg'
        },
        {
            id: 'bolso-10',
            nombre: 'Bolso Amazónico',
            descripcion: 'Bolsos únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 55000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Bolsos/bolso10.jpg'
        },
        {
            id: 'bolso-11',
            nombre: 'Bolso Amazónico',
            descripcion: 'Bolsos únicos con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 55000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Bolsos/bolso11.jpg'
        },

        // ACCESORIOS - CHAPAS
        {
            id: 'chapa-1',
            nombre: 'Chapa Personalizada',
            descripcion: 'Diseño único para ti. Personalizamos con tu nombre, logo o diseño especial.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 0,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Chapas/chapa1.jpg'
        },
        {
            id: 'chapa-2',
            nombre: 'Chapa Personalizada',
            descripcion: 'Diseño único para ti. Personalizamos con tu nombre, logo o diseño especial.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 0,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Chapas/chapa2.jpg'
        },
        {
            id: 'chapa-3',
            nombre: 'Chapa Personalizada',
            descripcion: 'Diseño único para ti. Personalizamos con tu nombre, logo o diseño especial.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 0,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Chapas/chapa3.jpg'
        },
        {
            id: 'chapa-4',
            nombre: 'Chapa Personalizada',
            descripcion: 'Diseño único para ti. Personalizamos con tu nombre, logo o diseño especial.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 0,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Chapas/chapa4.jpg'
        },
        {
            id: 'chapa-5',
            nombre: 'Chapa Personalizada',
            descripcion: 'Diseño único para ti. Personalizamos con tu nombre, logo o diseño especial.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 0,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Chapas/chapa5.jpg'
        },
        {
            id: 'chapa-6',
            nombre: 'Chapa Personalizada',
            descripcion: 'Diseño único para ti. Personalizamos con tu nombre, logo o diseño especial.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 0,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Chapas/chapa6.jpg'
        },
        {
            id: 'chapa-7',
            nombre: 'Chapa Personalizada',
            descripcion: 'Diseño único para ti. Personalizamos con tu nombre, logo o diseño especial.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 0,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Chapas/chapa7.jpg'
        },
        {
            id: 'chapa-8',
            nombre: 'Chapa Personalizada',
            descripcion: 'Diseño único para ti. Personalizamos con tu nombre, logo o diseño especial.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 0,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Chapas/chapa8.jpg'
        },
        {
            id: 'chapa-9',
            nombre: 'Chapa Personalizada',
            descripcion: 'Diseño único para ti. Personalizamos con tu nombre, logo o diseño especial.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 0,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Chapas/chapa9.jpg'
        },
        {
            id: 'chapa-10',
            nombre: 'Chapa Personalizada',
            descripcion: 'Diseño único para ti. Personalizamos con tu nombre, logo o diseño especial.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 0,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Chapas/chapa10.jpg'
        },

        // ACCESORIOS - GORRAS
        {
            id: 'gorra-1',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra1.jpg'
        },
        {
            id: 'gorra-2',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra2.jpg'
        },
        {
            id: 'gorra-3',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra3.jpg'
        },
        {
            id: 'gorra-4',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra4.jpg'
        },
        {
            id: 'gorra-5',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra5.jpg'
        },
        {
            id: 'gorra-6',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra6.jpg'
        },
        {
            id: 'gorra-7',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra7.jpg'
        },
        {
            id: 'gorra-8',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra8.jpg'
        },
        {
            id: 'gorra-9',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra9.jpg'
        },
        {
            id: 'gorra-10',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra10.jpg'
        },
        {
            id: 'gorra-11',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra11.jpg'
        },
        {
            id: 'gorra-12',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra12.jpg'
        },
        {
            id: 'gorra-13',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra13.jpg'
        },
        {
            id: 'gorra-14',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra14.jpg'
        },
        {
            id: 'gorra-15',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra15.jpg'
        },
        {
            id: 'gorra-16',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra16.jpg'
        },
        {
            id: 'gorra-17',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra17.jpg'
        },
        {
            id: 'gorra-19',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra19.jpg'
        },
        {
            id: 'gorra-20',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra20.jpg'
        },
        {
            id: 'gorra-21',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra21.jpg'
        },
        {
            id: 'gorra-22',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra22.jpg'
        },
        {
            id: 'gorra-23',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra23.jpg'
        },
        {
            id: 'gorra-24',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra24.jpg'
        },
        {
            id: 'gorra-25',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra25.jpg'
        },
        {
            id: 'gorra-26',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra26.jpg'
        },
        {
            id: 'gorra-27',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra27.jpg'
        },
        {
            id: 'gorra-28',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            state: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra28.jpg'
        },
        {
            id: 'gorra-29',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra29.jpg'
        },
        {
            id: 'gorra-30',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra30.jpg'
        },
        {
            id: 'gorra-31',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra31.jpg'
        },
        {
            id: 'gorra-32',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra32.jpg'
        },
        {
            id: 'gorra-33',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra33.jpg'
        },
        {
            id: 'gorra-34',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra34.jpg'
        },
        {
            id: 'gorra-35',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra35.jpg'
        },
        {
            id: 'gorra-36',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra36.jpg'
        },
        {
            id: 'gorra-37',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra37.jpg'
        },
        {
            id: 'gorra-38',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra38.jpg'
        },
        {
            id: 'gorra-39',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra39.jpg'
        },
        {
            id: 'gorra-40',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra40.jpg'
        },
        {
            id: 'gorra-41',
            nombre: 'Gorra Amazónica',
            descripcion: 'Gorras con diseños únicos de la Amazonía colombiana.',
            categoria: 'accesorios',
            precio: 30000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Gorras/gorra41.jpg'
        },

        // ACCESORIOS - IMANES NEVERA
        {
            id: 'iman-nevera-1',
            nombre: 'Imán de Nevera Amazónico',
            descripcion: 'Imanes decorativos para nevera con diseños amazónicos únicos.',
            categoria: 'accesorios',
            precio: 15000,
            stock: 25,
            estado: 'activo',
            imagen: 'images/productos/accesorios/ImanNevera/imanNevera1.jpg'
        },
        {
            id: 'iman-nevera-2',
            nombre: 'Imán de Nevera Amazónico',
            descripcion: 'Imanes decorativos para nevera con diseños amazónicos únicos.',
            categoria: 'accesorios',
            precio: 15000,
            stock: 25,
            estado: 'activo',
            imagen: 'images/productos/accesorios/ImanNevera/imanNevera2.jpg'
        },
        {
            id: 'iman-nevera-3',
            nombre: 'Imán de Nevera Amazónico',
            descripcion: 'Imanes decorativos para nevera con diseños amazónicos únicos.',
            categoria: 'accesorios',
            precio: 15000,
            stock: 25,
            estado: 'activo',
            imagen: 'images/productos/accesorios/ImanNevera/imanNevera3.jpg'
        },

        // ACCESORIOS - MONEDEROS
        {
            id: 'monedero-1',
            nombre: 'Monedero Amazónico',
            descripcion: 'Monederos únicos con diseños amazónicos tradicionales.',
            categoria: 'accesorios',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Monederos/monedero1.jpg'
        },
        {
            id: 'monedero-2',
            nombre: 'Monedero Amazónico',
            descripcion: 'Monederos únicos con diseños amazónicos tradicionales.',
            categoria: 'accesorios',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Monederos/monedero2.jpg'
        },
        {
            id: 'monedero-3',
            nombre: 'Monedero Amazónico',
            descripcion: 'Monederos únicos con diseños amazónicos tradicionales.',
            categoria: 'accesorios',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Monederos/monedero3.jpg'
        },
        {
            id: 'monedero-4',
            nombre: 'Monedero Amazónico',
            descripcion: 'Monederos únicos con diseños amazónicos tradicionales.',
            categoria: 'accesorios',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Monederos/monedero4.jpg'
        },
        {
            id: 'monedero-5',
            nombre: 'Monedero Amazónico',
            descripcion: 'Monederos únicos con diseños amazónicos tradicionales.',
            categoria: 'accesorios',
            precio: 35000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Monederos/monedero5.jpg'
        },

        // ACCESORIOS - MONIAS
        {
            id: 'monia-1',
            nombre: 'Muñeca Amazónica',
            descripcion: 'Muñecas artesanales con diseños tradicionales amazónicos.',
            categoria: 'accesorios',
            precio: 40000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Monias/monia1.jpg'
        },
        {
            id: 'monia-2',
            nombre: 'Muñeca Amazónica',
            descripcion: 'Muñecas artesanales con diseños tradicionales amazónicos.',
            categoria: 'accesorios',
            precio: 40000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Monias/monia2.jpg'
        },

        // ACCESORIOS - PONCHOS
        {
            id: 'poncho-1',
            nombre: 'Poncho Amazónico',
            descripcion: 'Ponchos tradicionales con diseños únicos de la Amazonía.',
            categoria: 'accesorios',
            precio: 75000,
            stock: 6,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Ponchos/poncho1.jpg'
        },
        {
            id: 'poncho-2',
            nombre: 'Poncho Amazónico',
            descripcion: 'Ponchos tradicionales con diseños únicos de la Amazonía.',
            categoria: 'accesorios',
            precio: 75000,
            stock: 6,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Ponchos/poncho2.jpg'
        },
        {
            id: 'poncho-3',
            nombre: 'Poncho Amazónico',
            descripcion: 'Ponchos tradicionales con diseños únicos de la Amazonía.',
            categoria: 'accesorios',
            precio: 75000,
            stock: 6,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Ponchos/poncho3.jpg'
        },
        {
            id: 'poncho-4',
            nombre: 'Poncho Amazónico',
            descripcion: 'Ponchos tradicionales con diseños únicos de la Amazonía.',
            categoria: 'accesorios',
            precio: 75000,
            stock: 6,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Ponchos/poncho4.jpg'
        },
        {
            id: 'poncho-5',
            nombre: 'Poncho Amazónico',
            descripcion: 'Ponchos tradicionales con diseños únicos de la Amazonía.',
            categoria: 'accesorios',
            precio: 75000,
            stock: 6,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Ponchos/poncho5.jpg'
        },
        {
            id: 'poncho-6',
            nombre: 'Poncho Amazónico',
            descripcion: 'Ponchos tradicionales con diseños únicos de la Amazonía.',
            categoria: 'accesorios',
            precio: 75000,
            stock: 6,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Ponchos/poncho6.jpg'
        },
        {
            id: 'poncho-7',
            nombre: 'Poncho Amazónico',
            descripcion: 'Ponchos tradicionales con diseños únicos de la Amazonía.',
            categoria: 'accesorios',
            precio: 75000,
            stock: 6,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Ponchos/poncho7.jpg'
        },
        {
            id: 'poncho-8',
            nombre: 'Poncho Amazónico',
            descripcion: 'Ponchos tradicionales con diseños únicos de la Amazonía.',
            categoria: 'accesorios',
            precio: 75000,
            stock: 6,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Ponchos/poncho8.jpg'
        },

        // ACCESORIOS - PORTA CELULARES
        {
            id: 'porta-celular-1',
            nombre: 'Porta Celular Amazónico',
            descripcion: 'Porta celulares únicos con diseños amazónicos tradicionales.',
            categoria: 'accesorios',
            precio: 28000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/PortaCelulares/portaCelular1.jpg'
        },
        {
            id: 'porta-celular-2',
            nombre: 'Porta Celular Amazónico',
            descripcion: 'Porta celulares únicos con diseños amazónicos tradicionales.',
            categoria: 'accesorios',
            precio: 28000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/PortaCelulares/portaCelular2.jpg'
        },
        {
            id: 'porta-celular-3',
            nombre: 'Porta Celular Amazónico',
            descripcion: 'Porta celulares únicos con diseños amazónicos tradicionales.',
            categoria: 'accesorios',
            precio: 28000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/PortaCelulares/portaCelular3.jpg'
        },
        {
            id: 'porta-celular-4',
            nombre: 'Porta Celular Amazónico',
            descripcion: 'Porta celulares únicos con diseños amazónicos tradicionales.',
            categoria: 'accesorios',
            precio: 28000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/PortaCelulares/portaCelular4.jpg'
        },
        {
            id: 'porta-celular-5',
            nombre: 'Porta Celular Amazónico',
            descripcion: 'Porta celulares únicos con diseños amazónicos tradicionales.',
            categoria: 'accesorios',
            precio: 28000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/PortaCelulares/portaCelular5.jpg'
        },
        {
            id: 'porta-celular-6',
            nombre: 'Porta Celular Amazónico',
            descripcion: 'Porta celulares únicos con diseños amazónicos tradicionales.',
            categoria: 'accesorios',
            precio: 28000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/PortaCelulares/portaCelular6.jpg'
        },

        // ACCESORIOS - PULSERAS
        {
            id: 'pulsera-1',
            nombre: 'Pulsera Amazónica',
            descripcion: 'Pulseras únicas con diseños inspirados en la naturaleza amazónica.',
            categoria: 'accesorios',
            precio: 20000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Pulsera/pulsera1.jpg'
        },

        // ACCESORIOS - SOMBREROS
        {
            id: 'sombrero-1',
            nombre: 'Sombrero Amazónico',
            descripcion: 'Sombreros tradicionales con diseños únicos de la Amazonía.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Sombreros/sombrero1.jpg'
        },
        {
            id: 'sombrero-2',
            nombre: 'Sombrero Amazónico',
            descripcion: 'Sombreros tradicionales con diseños únicos de la Amazonía.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Sombreros/sombrero2.jpg'
        },
        {
            id: 'sombrero-3',
            nombre: 'Sombrero Amazónico',
            descripcion: 'Sombreros tradicionales con diseños únicos de la Amazonía.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Sombreros/sombrero3.jpg'
        },
        {
            id: 'sombrero-4',
            nombre: 'Sombrero Amazónico',
            descripcion: 'Sombreros tradicionales con diseños únicos de la Amazonía.',
            categoria: 'accesorios',
            precio: 45000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/accesorios/Sombreros/sombrero4.jpg'
        },

        // HOGAR - CUADROS
        {
            id: 'cuadro-1',
            nombre: 'Cuadro Paisaje Amazónico',
            descripcion: 'Arte amazónico para tu hogar. Paisajes y cultura en cada obra.',
            categoria: 'hogar',
            precio: 75000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/hogar/Cuadros/cuadro1.jpg'
        },
        {
            id: 'cuadro-2',
            nombre: 'Cuadro Paisaje Amazónico',
            descripcion: 'Arte amazónico para tu hogar. Paisajes y cultura en cada obra.',
            categoria: 'hogar',
            precio: 75000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/hogar/Cuadros/cuadro2.jpg'
        },
        {
            id: 'cuadro-3',
            nombre: 'Cuadro Paisaje Amazónico',
            descripcion: 'Arte amazónico para tu hogar. Paisajes y cultura en cada obra.',
            categoria: 'hogar',
            precio: 75000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/hogar/Cuadros/cuadro3.jpg'
        },

        // HOGAR - POCILLOS
        {
            id: 'pocillo-1',
            nombre: 'Pocillo Amazónico',
            descripcion: 'Pocillos únicos con diseños amazónicos tradicionales.',
            categoria: 'hogar',
            precio: 18000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/hogar/Pocillos/pocillo1.jpg'
        },
        {
            id: 'pocillo-2',
            nombre: 'Pocillo Amazónico',
            descripcion: 'Pocillos únicos con diseños amazónicos tradicionales.',
            categoria: 'hogar',
            precio: 18000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/hogar/Pocillos/pocillo2.jpg'
        },
        {
            id: 'pocillo-3',
            nombre: 'Pocillo Amazónico',
            descripcion: 'Pocillos únicos con diseños amazónicos tradicionales.',
            categoria: 'hogar',
            precio: 18000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/hogar/Pocillos/pocillo3.jpg'
        },
        {
            id: 'pocillo-4',
            nombre: 'Pocillo Amazónico',
            descripcion: 'Pocillos únicos con diseños amazónicos tradicionales.',
            categoria: 'hogar',
            precio: 18000,
            stock: 1,
            estado: 'activo',
            imagen: 'images/productos/hogar/Pocillos/pocillo4.jpg'
        }
    ];

    return productosLocales;
}

// Función para migrar productos a Firebase
async function migrarProductosAFirebase() {
    try {
        console.log('🔄 Iniciando migración de productos...');
        
        if (!window.firebaseService || !window.firebaseService.initialized) {
            console.error('❌ Firebase no está inicializado');
            return;
        }

        const productosLocales = obtenerProductosLocales();
        console.log(`📦 Total de productos locales: ${productosLocales.length}`);

        // Obtener productos existentes en Firebase
        const productosExistentes = await window.firebaseService.getAllProducts();
        const idsExistentes = productosExistentes.success ? productosExistentes.data.map(p => p.id) : [];
        console.log(`🔥 Productos existentes en Firebase: ${idsExistentes.length}`);

        // Filtrar productos que no existen en Firebase Y asegurar unicidad por imagen
        const imagenesUsadas = productosExistentes.success ? productosExistentes.data.map(p => p.imagen) : [];
        const productosNuevos = productosLocales.filter(producto => {
            const idNoExiste = !idsExistentes.includes(producto.id);
            const imagenNoRepetida = !imagenesUsadas.includes(producto.imagen);
            return idNoExiste && imagenNoRepetida;
        });
        console.log(`✨ Productos nuevos y únicos para migrar: ${productosNuevos.length}`);

        if (productosNuevos.length === 0) {
            console.log('✅ Todos los productos ya están en Firebase');
            return;
        }

        // Verificar productos duplicados antes de migrar
        const productosUnicos = [];
        const imagenesVistas = new Set();
        const nombresVistos = new Set();
        
        for (const producto of productosNuevos) {
            // Verificar que no exista otro producto con la misma imagen
            if (!imagenesVistas.has(producto.imagen)) {
                imagenesVistas.add(producto.imagen);
                
                // Verificar que no exista otro producto con el mismo nombre e imagen
                const claveUnica = `${producto.nombre}-${producto.imagen}`;
                if (!nombresVistos.has(claveUnica)) {
                    nombresVistos.add(claveUnica);
                    productosUnicos.push(producto);
                } else {
                    console.log(`⚠️ Duplicado ignorado: ${producto.nombre} - ${producto.imagen}`);
                }
            }
        }
        
        console.log(`🎯 Productos únicos finales: ${productosUnicos.length}`);
        
        // Migrar productos uno por uno
        let migrados = 0;
        let errores = 0;

        for (const producto of productosUnicos) {
            try {
                console.log(`🔄 Migrando: ${producto.nombre} (${producto.id}) - ${producto.imagen}`);
                
                // Agregar fecha de creación
                const productoConFecha = {
                    ...producto,
                    fechaCreacion: new Date().toISOString(),
                    fechaActualizacion: new Date().toISOString()
                };

                // Guardar en Firebase
                const resultado = await window.firebaseService.addProduct(productoConFecha);
                
                if (resultado.success) {
                    migrados++;
                    console.log(`✅ Migrado: ${producto.nombre} - ${producto.imagen}`);
                } else {
                    errores++;
                    console.error(`❌ Error migrando ${producto.nombre}:`, resultado.error);
                }

                // Pequeña pausa para no sobrecargar Firebase
                await new Promise(resolve => setTimeout(resolve, 100));

            } catch (error) {
                errores++;
                console.error(`❌ Error migrando ${producto.nombre}:`, error);
            }
        }

        console.log(`🎉 Migración completada:`);
        console.log(`✅ Productos migrados: ${migrados}`);
        console.log(`❌ Errores: ${errores}`);
        console.log(`📊 Total procesados: ${migrados + errores}`);

        // Actualizar localStorage también
        const productosActualizados = [...productosLocales];
        localStorage.setItem('pincelart_productos', JSON.stringify(productosActualizados));
        console.log('💾 Productos actualizados en localStorage');

    } catch (error) {
        console.error('❌ Error en migración:', error);
    }
}

// Función para verificar productos en Firebase
async function verificarProductosEnFirebase() {
    try {
        console.log('🔍 Verificando productos en Firebase...');
        
        if (!window.firebaseService || !window.firebaseService.initialized) {
            console.error('❌ Firebase no está inicializado');
            return;
        }

        const resultado = await window.firebaseService.getAllProducts();
        
        if (resultado.success) {
            console.log(`✅ Productos encontrados en Firebase: ${resultado.data.length}`);
            
            // Mostrar estadísticas por categoría
            const porCategoria = resultado.data.reduce((acc, producto) => {
                acc[producto.categoria] = (acc[producto.categoria] || 0) + 1;
                return acc;
            }, {});
            
            console.log('📊 Productos por categoría:');
            Object.entries(porCategoria).forEach(([categoria, cantidad]) => {
                console.log(`  ${categoria}: ${cantidad}`);
            });

            // Verificar si están las pulseras
            const pulseras = resultado.data.filter(p => p.nombre.toLowerCase().includes('pulsera'));
            console.log(`🔍 Pulseras encontradas: ${pulseras.length}`);
            
            if (pulseras.length > 0) {
                pulseras.forEach(pulsera => {
                    console.log(`  - ${pulsera.nombre} (${pulsera.id})`);
                });
            }

        } else {
            console.error('❌ Error obteniendo productos:', resultado.error);
        }

    } catch (error) {
        console.error('❌ Error verificando productos:', error);
    }
}

// Ejecutar migración automáticamente
console.log('🚀 Ejecutando migración automática...');
migrarProductosAFirebase().then(() => {
    console.log('✅ Migración automática completada');
    verificarProductosEnFirebase();
});

// Exportar funciones para uso manual
window.migrarProductosAFirebase = migrarProductosAFirebase;
window.verificarProductosEnFirebase = verificarProductosEnFirebase;
window.obtenerProductosLocales = obtenerProductosLocales;
