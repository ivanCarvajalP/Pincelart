# Script Python para generar TODOS los productos desde las imágenes
import os

# Leer las rutas de las imágenes
with open('lista-imagenes.txt', 'r', encoding='utf-8') as f:
    imagenes = [line.strip() for line in f if line.strip()]

print(f"Total de imágenes: {len(imagenes)}")

# Diccionario de precios por tipo de producto
precios = {
    'arete': 25000, 'areteCollar': 45000, 'bolso': 55000, 'chapa': 45000,
    'gorra': 30000, 'imanNevera': 15000, 'monedero': 35000, 'monia': 40000,
    'poncho': 75000, 'portaCelular': 28000, 'pulsera': 20000, 'sombrero': 45000,
    'cuadro': 75000, 'pocillo': 18000, 'busoMas': 35000, 'busoFem': 38000,
    'blusonFem': 42000, 'conjuntoAmazonico': 85000, 'guayabera': 65000
}

descripciones = {
    'arete': 'Aretes únicos con diseños inspirados en la naturaleza amazónica.',
    'areteCollar': 'Combinación única de arete y collar con diseños amazónicos.',
    'bolso': 'Bolsos únicos con diseños inspirados en la naturaleza amazónica.',
    'chapa': 'Diseño único para ti. Personalizamos con tu nombre, logo o diseño especial.',
    'gorra': 'Gorras con diseños únicos de la Amazonía colombiana.',
    'imanNevera': 'Imanes decorativos para nevera con diseños amazónicos únicos.',
    'monedero': 'Monederos únicos con diseños amazónicos tradicionales.',
    'monia': 'Muñecas artesanales con diseños tradicionales amazónicos.',
    'poncho': 'Ponchos tradicionales con diseños únicos de la Amazonía.',
    'portaCelular': 'Porta celulares únicos con diseños amazónicos tradicionales.',
    'pulsera': 'Pulseras únicas con diseños inspirados en la naturaleza amazónica.',
    'sombrero': 'Sombreros tradicionales con diseños únicos de la Amazonía.',
    'cuadro': 'Arte amazónico para tu hogar. Paisajes y cultura en cada obra.',
    'pocillo': 'Pocillos únicos con diseños amazónicos tradicionales.',
    'busoMas': 'Comodidad y estilo con diseños únicos de la Amazonía. Ideales para el día a día.',
    'busoFem': 'Elegancia y comodidad para la mujer moderna. Diseños únicos amazónicos.',
    'blusonFem': 'Blusón elegante con diseños amazónicos únicos.',
    'conjuntoAmazonico': 'Conjunto elegante que combina tradición y modernidad amazónica.',
    'guayaberaFem': 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales.',
    'guayaberaMas': 'Elegancia y tradición amazónica en cada puntada. Perfecta para ocasiones especiales.'
}

nombres = {
    'arete': 'Aretes Amazónicos',
    'areteCollar': 'Arete Collar Amazónico',
    'bolso': 'Bolso Amazónico',
    'chapa': 'Chapa Personalizada',
    'gorra': 'Gorra Amazónica',
    'imanNevera': 'Imán de Nevera Amazónico',
    'monedero': 'Monedero Amazónico',
    'monia': 'Muñeca Amazónica',
    'poncho': 'Poncho Amazónico',
    'portaCelular': 'Porta Celular Amazónico',
    'pulsera': 'Pulsera Amazónica',
    'sombrero': 'Sombrero Amazónico',
    'cuadro': 'Cuadro Paisaje Amazónico',
    'pocillo': 'Pocillo Amazónico',
    'busoMas': 'Buso Deportivo Masculino',
    'busoFem': 'Buso Deportivo Femenino',
    'blusonFem': 'Blusón Femenino',
    'conjuntoAmazonico': 'Conjunto Amazónico Femenino',
    'guayaberaFem': 'Guayabera Amazónica Femenina',
    'guayaberaMas': 'Guayabera Amazónica Masculina'
}

stocks = {
    'chapa': 0, 'gorra': 15, 'imanNevera': 25, 'monedero': 12, 'monia': 8,
    'poncho': 6, 'portaCelular': 18, 'pulsera': 30, 'sombrero': 10,
    'cuadro': 5, 'pocillo': 20, 'busoMas': 8, 'busoFem': 12, 'blusonFem': 6,
    'conjuntoAmazonico': 4, 'guayabera': 15, 'arete': 20
}

productos = []

for img in imagenes:
    # Extraer categoría
    categoria = 'accesorios'
    if '/Ropa/' in img:
        categoria = 'ropa'
    elif '/hogar/' in img:
        categoria = 'hogar'
    
    # Extraer nombre del archivo
    partes = img.split('/')
    archivo = partes[-1]
    nombreArchivo = archivo.replace('.jpg', '')
    
    # Determinar tipo de producto
    tipoProducto = nombreArchivo
    if 'arete' in nombreArchivo and 'Collar' in img:
        tipoProducto = 'areteCollar'
    elif 'arete' in nombreArchivo:
        tipoProducto = 'arete'
    elif 'busoMas' in nombreArchivo or 'buso_mas' in nombreArchivo:
        tipoProducto = 'busoMas'
    elif 'busoFem' in nombreArchivo:
        tipoProducto = 'busoFem'
    elif 'bluson' in nombreArchivo:
        tipoProducto = 'blusonFem'
    elif 'conjunto' in nombreArchivo:
        tipoProducto = 'conjuntoAmazonico'
    elif 'guayaberaFem' in nombreArchivo:
        tipoProducto = 'guayaberaFem'
    elif 'guayaberaMas' in nombreArchivo:
        tipoProducto = 'guayaberaMas'
    elif 'guayabera' in nombreArchivo:
        tipoProducto = 'guayabera'
    
    # Obtener precio
    precio = precios.get(tipoProducto, 30000)
    
    # Obtener stock
    stock = stocks.get(tipoProducto, 10)
    
    # Obtener nombre
    nombre = nombres.get(tipoProducto, f'Producto {categoria.capitalize()}')
    
    # Obtener descripción
    desc = descripciones.get(tipoProducto, f'Producto único de {categoria}')
    
    # Crear producto
    producto = {
        'id': img.replace('images/productos/', '').replace('.jpg', '').replace('/', '-'),
        'nombre': nombre,
        'descripcion': desc,
        'categoria': categoria,
        'precio': precio,
        'stock': stock,
        'estado': 'activo',
        'imagen': img,
        'fechaCreacion': '2025-01-15T00:00:00.000Z',
        'fechaActualizacion': '2025-01-15T00:00:00.000Z'
    }
    
    productos.append(producto)

# Guardar en archivo JSON
import json
with open('todos-productos.json', 'w', encoding='utf-8') as f:
    json.dump(productos, f, ensure_ascii=False, indent=2)

print(f"\n✅ Generados {len(productos)} productos")
print(f"📁 Archivo guardado: todos-productos.json")
print(f"\n📊 Resumen:")
categoria_count = {}
for p in productos:
    categoria_count[p['categoria']] = categoria_count.get(p['categoria'], 0) + 1
for cat, count in categoria_count.items():
    print(f"  {cat}: {count} productos")



