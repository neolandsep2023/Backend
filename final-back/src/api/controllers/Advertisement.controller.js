const { deleteImgCloudinary } = require("../../middleware/files.middleware");
const Advertisement = require("../models/Advertisement.model");

//!----------------CREATE--------------------

const create = async (req, res, next) => {
    let catchImg = req.file?.path; 
    try {
      await Advertisement.syncIndexes(); 
      const newAdvertisement = new Advertisement(req.body); 
      req.file 
        ? (newAdvertisement.image = catchImg)
        : (newAdvertisement.image ="");
  
      const saveAdvertisement = await newAdvertisement.save();
      return res
        .status(saveAdvertisement ? 200 : 404)
        .json(
            saveAdvertisement
            ? saveAdvertisement
            : { message: "No se ha podido guardar el anuncio en la DB ❌" },
        );
    } catch (error) {
      req.file?.path ? deleteImgCloudinary(catchImg) : null; 
      return res.status(500).json({
        error: 'Error en el catch ❌',
        message: error.message,
      });
    }
  };

  //!-----------UPDATE-------------------

  const update = async (req, res, next) => {
    await Advertisement.syncIndexes(); 
    let catchImg = req.file?.path; 
    try {
      const { id } = req.params; 
      const advertisementById = await Advertisement.findById(id);
      if (advertisementById) {
        const oldImg = advertisementById.image; 
  
        const customBody = {
          _id: advertisementById._id, 
          image: req.file?.path ? catchImg : oldImg, 
        };
  
        try {
          await Advertisement.findByIdAndUpdate(id, customBody); 
          if (req.file?.path) {
            deleteImgCloudinary(oldImg);
          }
          //!           -------------------
          //!           | RUNTIME TESTING |
          //!           -------------------
  
          const advertisementByIdUpdated =
            await Advertisement.findById(id)
          const elementUpdate = Object.keys(req.body); 
          let test = []; 
  
          elementUpdate.forEach((key) => {
            
            if (req.body[key] === advertisementByIdUpdated[key]) {
              
              test.push({ [key]: true }); 
            } else {
              test.push({ [key]: false }); 
            }
          });
  
          if (catchImg) {
            advertisementByIdUpdated.image = catchImg 
              ? (test = { ...test, file: true }) 
              : (test = { ...test, file: false });
          }
  
          let acc = 0;
          for (let clave in test) {
            
            test[clave] == false ? acc++ : null; 
          }
  
          if (acc > 0) {
            
            return res.status(404).json({
              dataTest: test, 
              update: false,
            });
          } else {
            return res.status(200).json({
              dataTest: test,
              update: true,
              advertisementUpdated: advertisementByIdUpdated,
            });
          }
        } catch (error) {
            return res.status(500).json({
                error: 'Error al guardar el anuncio actualizado en el catch ❌',
                message: error.message,
              });
        }
      } else {
        return res.status(404).json("este anuncio no existe ❌");
      }
    } catch (error) {
        return res.status(500).json({
            error: 'Error general al actualizar el anuncio en el catch ❌',
            message: error.message,
          });
    }
  };

  //! --------------- DELETE ----------------
const deleteAdvertisement = async (req, res, next) => {
    try {
      const { id } = req.params;
      const team = await Advertisement.findByIdAndDelete(id); 
  
      if (team) {
        const findByIdAdvertisement = await Advertisement.findById(id); 
        return res.status(findByIdAdvertisement ? 404 : 200).json({
          deleteTest: findByIdAdvertisement ? false : true, 
        });
      } else {
        return res.status(404).json("este anuncio no existe ❌"); 
      }
    } catch (error) {
        return res.status(500).json({
            error: 'Error general al borrar el anuncio en el catch ❌',
            message: error.message,
          });
    }
  };

  module.exports = {
    create,
    update,
    deleteAdvertisement,
  };