// Script de migración de productos a Firebase (nueva cuenta)
// Ejecutar este script UNA SOLA VEZ para migrar los 166 productos a Firebase

async function migrarProductosANuevaFirebase() {
    console.log('🚀 Iniciando migración de productos a nueva cuenta de Firebase...');
    
    // Verificar que firebaseService esté disponible
    if (!window.firebaseService) {
        console.error('❌ firebaseService no está disponible');
        return;
    }
    
    if (!window.firebaseService.initialized) {
        console.error('❌ Firebase no está inicializado');
        return;
    }
    
    // Obtener productos locales
    const productos = obtenerProductosLocales();
    console.log(`📦 Total de productos a migrar: ${productos.length}`);
    
    let migrados = 0;
    let errores = 0;
    
    // Migrar cada producto
    for (const producto of productos) {
        try {
            await window.firebaseService.addProduct(producto);
            migrados++;
            console.log(`✅ Producto migrado: ${producto.nombre} (${migrados}/${productos.length})`);
        } catch (error) {
            errores++;
            console.error(`❌ Error migrando ${producto.nombre}:`, error);
        }
    }
    
    console.log(`🎉 Migración completada:`);
    console.log(`✅ Productos migrados: ${migrados}`);
    console.log(`❌ Errores: ${errores}`);
    console.log(`📊 Total procesados: ${productos.length}`);
    
    alert(`Migración completada!\n${migrados} productos migrados exitosamente\n${errores} errores`);
}

// Ejecutar la migración automáticamente cuando se carga la página
window.addEventListener('load', function() {
    // Esperar a que Firebase esté listo
    setTimeout(async () => {
        // Descomentar la siguiente línea para ejecutar la migración automáticamente
        // await migrarProductosANuevaFirebase();
        
        console.log('💡 Para migrar productos, ejecUTO en la consola del navegador:');
        console.log('await migrarProductosANuevaFirebase();');
    }, 3000);
});

// Exponer función globalmente
window.migrarProductosANuevaFirebase = migrarProductosANuevaFirebase;

