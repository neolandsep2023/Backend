const getRandomAdvertisement = async (req, res) => {
    try {
      const advertisements = await Advertisement.find(); // no estoy seguro si es find o getAll
      const randomAdvertisement = advertisements[Math.floor(Math.random() * advertisements.length)];
      res.json(randomAdvertisement);

    } catch (error) {
      return res.status(500).json({
            error: 'Error al obtener el anuncio aleatorio en el catch ❌',
            message: error.message,
          });
    }
  };

  module.exports = getRandomAdvertisement;