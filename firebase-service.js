// Utilidades de Firebase para PincelArt
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
} from "firebase/firestore";
import { db } from "./firebase-config.js";

// Clase para manejar operaciones de base de datos
class FirebaseService {
  constructor() {
    this.db = db;
  }

  // ========== OPERACIONES DE USUARIOS/VENDEDORES ==========
  
  // Crear nuevo usuario/vendedor
  async crearUsuario(usuarioData) {
    try {
      const docRef = await addDoc(collection(this.db, "usuarios"), {
        ...usuarioData,
        fechaCreacion: serverTimestamp(),
        fechaModificacion: serverTimestamp(),
        activo: true
      });
      return { id: docRef.id, ...usuarioData };
    } catch (error) {
      console.error("Error creando usuario:", error);
      throw error;
    }
  }

  // Obtener todos los usuarios
  async obtenerUsuarios() {
    try {
      const querySnapshot = await getDocs(collection(this.db, "usuarios"));
      const usuarios = [];
      querySnapshot.forEach((doc) => {
        usuarios.push({ id: doc.id, ...doc.data() });
      });
      return usuarios;
    } catch (error) {
      console.error("Error obteniendo usuarios:", error);
      throw error;
    }
  }

  // Obtener usuario por ID
  async obtenerUsuarioPorId(id) {
    try {
      const docRef = doc(this.db, "usuarios", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo usuario:", error);
      throw error;
    }
  }

  // Actualizar usuario
  async actualizarUsuario(id, datosActualizados) {
    try {
      const docRef = doc(this.db, "usuarios", id);
      await updateDoc(docRef, {
        ...datosActualizados,
        fechaModificacion: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      throw error;
    }
  }

  // Eliminar usuario (marcar como inactivo)
  async eliminarUsuario(id) {
    try {
      const docRef = doc(this.db, "usuarios", id);
      await updateDoc(docRef, {
        activo: false,
        fechaModificacion: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      throw error;
    }
  }

  // ========== OPERACIONES DE PRODUCTOS ==========
  
  // Crear nuevo producto
  async crearProducto(productoData) {
    try {
      const docRef = await addDoc(collection(this.db, "productos"), {
        ...productoData,
        fechaCreacion: serverTimestamp(),
        fechaModificacion: serverTimestamp(),
        activo: true
      });
      return { id: docRef.id, ...productoData };
    } catch (error) {
      console.error("Error creando producto:", error);
      throw error;
    }
  }

  // Obtener todos los productos
  async obtenerProductos() {
    try {
      const querySnapshot = await getDocs(collection(this.db, "productos"));
      const productos = [];
      querySnapshot.forEach((doc) => {
        productos.push({ id: doc.id, ...doc.data() });
      });
      return productos;
    } catch (error) {
      console.error("Error obteniendo productos:", error);
      throw error;
    }
  }

  // Obtener producto por ID
  async obtenerProductoPorId(id) {
    try {
      const docRef = doc(this.db, "productos", id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      } else {
        return null;
      }
    } catch (error) {
      console.error("Error obteniendo producto:", error);
      throw error;
    }
  }

  // Actualizar producto
  async actualizarProducto(id, datosActualizados) {
    try {
      const docRef = doc(this.db, "productos", id);
      await updateDoc(docRef, {
        ...datosActualizados,
        fechaModificacion: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error actualizando producto:", error);
      throw error;
    }
  }

  // Eliminar producto (marcar como inactivo)
  async eliminarProducto(id) {
    try {
      const docRef = doc(this.db, "productos", id);
      await updateDoc(docRef, {
        activo: false,
        fechaModificacion: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error("Error eliminando producto:", error);
      throw error;
    }
  }

  // ========== OPERACIONES DE VENTAS ==========
  
  // Crear nueva venta
  async crearVenta(ventaData) {
    try {
      const docRef = await addDoc(collection(this.db, "ventas"), {
        ...ventaData,
        fechaCreacion: serverTimestamp(),
        activo: true
      });
      return { id: docRef.id, ...ventaData };
    } catch (error) {
      console.error("Error creando venta:", error);
      throw error;
    }
  }

  // Obtener todas las ventas
  async obtenerVentas() {
    try {
      const querySnapshot = await getDocs(collection(this.db, "ventas"));
      const ventas = [];
      querySnapshot.forEach((doc) => {
        ventas.push({ id: doc.id, ...doc.data() });
      });
      return ventas;
    } catch (error) {
      console.error("Error obteniendo ventas:", error);
      throw error;
    }
  }

  // ========== MIGRACIÓN DESDE LOCALSTORAGE ==========
  
  // Migrar datos desde localStorage a Firebase
  async migrarDesdeLocalStorage() {
    try {
      console.log("Iniciando migración desde localStorage...");
      
      // Migrar usuarios
      const usuariosLocal = JSON.parse(localStorage.getItem('pincelart_users')) || [];
      for (const usuario of usuariosLocal) {
        if (!usuario.id) continue; // Saltar si no tiene ID
        try {
          await this.crearUsuario(usuario);
          console.log(`Usuario migrado: ${usuario.name}`);
        } catch (error) {
          console.log(`Error migrando usuario ${usuario.name}:`, error);
        }
      }

      // Migrar productos
      const productosLocal = JSON.parse(localStorage.getItem('pincelart_productos')) || [];
      for (const producto of productosLocal) {
        if (!producto.id) continue; // Saltar si no tiene ID
        try {
          await this.crearProducto(producto);
          console.log(`Producto migrado: ${producto.nombre}`);
        } catch (error) {
          console.log(`Error migrando producto ${producto.nombre}:`, error);
        }
      }

      // Migrar ventas
      const ventasLocal = JSON.parse(localStorage.getItem('pincelart_ventas')) || [];
      for (const venta of ventasLocal) {
        if (!venta.id) continue; // Saltar si no tiene ID
        try {
          await this.crearVenta(venta);
          console.log(`Venta migrada: ${venta.id}`);
        } catch (error) {
          console.log(`Error migrando venta ${venta.id}:`, error);
        }
      }

      console.log("Migración completada!");
      return true;
    } catch (error) {
      console.error("Error en migración:", error);
      throw error;
    }
  }
}

// Crear instancia global
const firebaseService = new FirebaseService();

// Exportar para uso global
export default firebaseService;
