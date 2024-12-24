const AdvertisementsService = require('../services/advertisementService');



class AdvertisementsController {
  async getAdvertisements(req, res) {
    const { page = 1, limit = 10, status, departamento } = req.query;
    try {
      const ads = await AdvertisementsService.getAllAdvertisements(
        Number(page),
        Number(limit),
        status,
        departamento
      );
      res.status(200).json(ads);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }

  async getAdvertisementById(req, res) {
    const { id } = req.params;
    try {
      const ad = await AdvertisementsService.getAdvertisementById(id);
      res.status(200).json(ad);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async createAdvertisement(req, res) {
    try {
      const createdAd = await AdvertisementsService.createAdvertisement(req.body);
      res.status(201).json(createdAd);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }


  async updateAdvertisement(req, res) {
    const { id } = req.params;
    try {
      const updatedAd = await AdvertisementsService.updateAdvertisement(id, req.body);
      res.status(200).json(updatedAd);
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }

  async deleteAdvertisement(req, res) {
    const { id } = req.params;
    try {
      await AdvertisementsService.deleteAdvertisement(id);
      res.status(204).send();
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}

module.exports = new AdvertisementsController();
