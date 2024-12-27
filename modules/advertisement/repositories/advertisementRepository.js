const db = require('../../../db'); // Importar la función para abrir la base de datos



class AdvertisementsRepository {
  /**
   * Obtener anuncios con paginación y filtros
   */
  async getAdvertisements(page, limit, status = null, departamento = null) {
    const database = await db.openDatabase();

    try {
      const offset = (page - 1) * limit; 
  
      let query = `SELECT * FROM advertisements WHERE 1=1`;
      const params = [];
  
      if (status) {
        query += ` AND status = ?`;
        params.push(status);
      }
  
      if (departamento) {
        query += ` AND departments = ?`;
        params.push(departamento);
      }
  
      query += ` LIMIT ? OFFSET ?`;
      params.push(limit, offset);
  
      const results = await database.all(query, params);
      return results;
    } catch (err) {
      console.error('Error en obtenerCitas:', err);
      throw err;
    } finally {
      await database.close();
    }
  }

  /**
   * Obtener un anuncio por ID
   */
  async getAdvertisementById(id) {
    const database = await db.openDatabase();

    try {
      const result = await database.get(
        `SELECT * FROM advertisements WHERE id_advertisements = ?`,
        [id]
      );
      return result;
    } catch (err) {
      console.error('Error en obteneAnunciosPorId:', err);
      throw err;
    } finally {
      await database.close();
    }
  }

  /**
   * Crear un nuevo anuncio
   */
  async createAdvertisement(nuevoProducto) {
    const database = await db.openDatabase();

    try {
      const { title, description, issue_date, expiration_date, departments } = nuevoProducto;
      const result = await database.run(
        `INSERT INTO advertisements (title, description, issue_date, expiration_date, departments) VALUES (?, ?, ?, ?, ?)`,
        [title, description, issue_date, expiration_date, departments]
      );
      return { id_advertisements: result.lastID,status:'activo', ...nuevoProducto };
    } catch (err) {
      console.error('Error en crearAnuncio:', err);
      throw err;
    } finally {
      await database.close();
    }
  }

  /**
   * Actualizar un anuncio
   */
  async updateAdvertisement(id, datosActualizados) {
    const database = await db.openDatabase();

    try {
      const { title, description, status, issue_date, expiration_date, departments } = datosActualizados;
      const result = await database.run(
        `UPDATE advertisements SET title = ?, description = ?, status = ?, issue_date = ?, expiration_date = ?, departments = ? WHERE id_advertisements = ?`,
        [title, description, status, issue_date, expiration_date, departments, id]
      );
      return result.changes > 0 ? { id_advertisements: id, ...datosActualizados } : null;
    } catch (err) {
      console.error('Error en actualizarAnuncio:', err);
      throw err;
    } finally {
      await database.close();
    }
  }

  /**
   * Eliminar un anuncio (marcar como inactivo)
   */
  async deleteAdvertisement(id) {
    const database = await db.openDatabase();

    try {
      const result = await database.run(
        `UPDATE advertisements SET status = 'inactivo' WHERE id_advertisements = ?`,
        [id]
      );
      return result.changes > 0;
    } catch (err) {
      console.error('Error en eliminarAnuncio:', err);
      throw err;
    } finally {
      await database.close();
    }
  }

  /**
   * Obtener correos electrónicos de empleados activos
   */
  async getActiveEmployeesEmails() {
    const database = await db.openDatabase();

    try {
      const results = await database.all(
        `SELECT email FROM employees WHERE status = 'activo'`
      );
      return results.map(emp => emp.email);
    } catch (err) {
      console.error('Error en getActiveEmployeesEmails:', err);
      throw err;
    } finally {
      await database.close();
    }
  }

  /**
   * Actualiza los anuncios vencidos
   */
  async updateExpiredAds(currentDate) {
    const database = await db.openDatabase();

    try {
      const result = await database.run(
        `UPDATE advertisements
         SET status = 'inactivo'
         WHERE expiration_date < date(?) AND status = 'activo'`,
        [currentDate]
      );
      console.log(`${result.changes} anuncios actualizados a 'inactivo'.`);
    } catch (err) {
      console.error('Error en actualizarEstadosVencidos:', err);
      throw err;
    } finally {
      await database.close();
    }
  }
}

module.exports = AdvertisementsRepository;
