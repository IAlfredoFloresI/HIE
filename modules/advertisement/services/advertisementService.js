const AdvertisementsRepository = require('../repositories/advertisementRepository');
const db = require('../../../db');
const repo = new AdvertisementsRepository(db);
const {sendEmail} = require('../../../helpers/emailSender2');




class AdvertisementsService {
  constructor() {
    this.advertisementsRepository = new AdvertisementsRepository();
  }

  async getAllAdvertisements(page = 1, limit = 10, status, departamento) {
    return await this.advertisementsRepository.getAdvertisements(page, limit, status, departamento);
  }

  async getAdvertisementById(id) {
    const ad = await this.advertisementsRepository.getAdvertisementById(id);
    if (!ad) {
      throw new Error('Advertisement not found');
    }
    return ad;
  }

  async createAdvertisement(data) {
    const { title, description, status, issue_date, expiration_date, departments } = data;

    const currentDate = new Date().toISOString().split('T')[0];;
    const issueDate = new Date(issue_date).toISOString().split('T')[0];;
    const expirationDate = new Date(expiration_date).toISOString().split('T')[0];;

    // Validar que las fechas sean correctas
    if (issueDate < currentDate) {
      throw new Error('La fecha de emisión debe ser igual o mayor a la fecha actual.');
    }

    if (expirationDate < currentDate) {
      throw new Error('La fecha de expiración no puede ser menor a la fecha actual.');
    }

    if (expirationDate <= issueDate) {
      throw new Error('La fecha de expiración debe ser posterior a la fecha de emisión.');
    }
    // Crear el anuncio con status predeterminado
    const nuevoProducto = {
      title,
      description,
      issue_date,
      expiration_date,
      departments,
      status: 'activo',
    };

    const createdAd = await this.advertisementsRepository.createAdvertisement(data);

    // Obtener correos de empleados activos
    const activeEmails = await this.advertisementsRepository.getActiveEmployeesEmails();

    // Enviar correos
    const subject = `Nuevo anuncio: ${title}`;
    const text = `Hola,\n\nSe ha publicado un nuevo anuncio:\n\nTítulo: ${title}\nDescripción: ${description}\nFecha de emisión: ${issue_date}\nFecha de expiración: ${expiration_date}\nDepartamento: ${departments}`;

    for (const email of activeEmails) {
      try {
        await sendEmail(email, subject, text);
      } catch (error) {
        console.error(`Error al enviar correo a ${email}: ${error.message}`);
      }
    }

    return createdAd;
  }


  async updateAdvertisement(id, data) {
    const { issue_date, expiration_date } = data;
    if (new Date(issue_date) >= new Date(expiration_date)) {
      throw new Error('Expiration date must be after issue date');
    }
    const updatedAd = await this.advertisementsRepository.updateAdvertisement(id, data);
    if (!updatedAd) {
      throw new Error('Advertisement not found');
    }
    return updatedAd;
  }

  async deleteAdvertisement(id) {
    const deleted = await this.advertisementsRepository.deleteAdvertisement(id);
    if (!deleted) {
      throw new Error('Advertisement not found');
    }
    return deleted;
  }

  // Método para actualizar automáticamente el estado de los anuncios
  async updateExpiredAds() {
    const currentDate = new Date().toISOString().split('T')[0]; // Fecha actual en formato YYYY-MM-DD
    await this.advertisementsRepository.updateExpiredAds(currentDate);
  }
}

module.exports = new AdvertisementsService();