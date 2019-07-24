'use strict';

const routes = require('express').Router();
const models = require('../models');

// -- CREATE CATEGORY ------------------------------------------------------

routes.post('', async (req, res, next) => {
  const { quantity, active } = req.body;
  const quantityCartridge = req.body.quantityCartridge || 1;

  const cartridges = [];
  for (let i = 1; i <= quantityCartridge; ++i) {
    // eslint-disable-next-line no-await-in-loop
    const cartridge = await models.Cartridge.create(
      { quantity, active }
    );

    cartridges.push(cartridge.code);
  }

  res.json({ items: cartridges });
});

// -- DELETE ------------------------------------------------------

routes.delete('/:id', async (req, res, next) => {
  const { id } = req.params;
  await models.Cartridge.destroy({ where: { id } });
  return res.json({ id });
});


// -- UPDATE STATIC ------------------------------------------------------

routes.patch('/statistics/:id', async (req, res, next) => {
  const { id } = req.params;
  const { deviceId, printed = 0 } = req.body;

  const response = await models.Cartridge.update(
    { lastDeviceId: deviceId, printed }, { returning: true, where: { id } }
  );

  const cartridge = response && response[1] && response[1][0];

  if (!cartridge) return next(new Error('CARTRIDGE_DOES_NOT_EXIST'));

  return res.json({
    quantity: cartridge.quantity,
    printed: cartridge.printed,
    active: cartridge.active
  });
});

routes.get('/activation/:code', async (req, res, next) => {
  const { code } = req.params;

  const cartridge = await models.Cartridge.findOne({
    where: { code },
    attributes: ['id', 'quantity', 'printed', 'active']
  });

  if (!cartridge) return next(new Error('CARTRIDGE_DOES_NOT_EXIST'));

  return res.json({
    id: cartridge.id,
    quantity: cartridge.quantity,
    printed: cartridge.printed,
    active: cartridge.active
  });
});

// -- GET CATEGORY ------------------------------------------------------

routes.get('', async (req, res) => {
  const cartridges = await models.Cartridge.findAll({
    order: ['code'],
    attributes: ['id', 'code', 'quantity', 'printed', 'active', 'lastActive', 'lastDeviceId']
  });

  res.json({ items: cartridges });
});

// -- UPDATE CATEGORY ------------------------------------------------------

routes.patch('/:id', async (req, res, next) => {
  const { id } = req.params;
  const { quantity, active } = req.body;

  let result = null;

  if (quantity || active) {
    const cartridge = await models.Cartridge.update(
      { quantity, active }, { returning: true, where: { id } }
    );
    result = cartridge && cartridge[1] && cartridge[1][0];
  } else {
    result = await models.Cartridge.findOne({
      where: { id },
      attributes: ['id', 'code', 'quantity', 'printed', 'active', 'lastActive', 'lastDeviceId']
    });
  }

  if (!result) return next(new Error('WRONG_PARAMS'));

  return res.json({
    id: result.id,
    code: result.code,
    quantity: result.quantity,
    printed: result.printed,
    active: result.active,
    lastActive: result.lastActive,
    lastDeviceId: result.lastDeviceId
  });
});


// -- GET CATEGORY PICTURE ------------------------------------------------------

// routes.get('/categories/:id', async (req, res, next) => {
//   const result = await models.Cartridge.findOne({ where: { id }, attributes: ['id'] });
//   res.sendFile(result);
// });


// // --------------------------------------------
// // --------------------------------------------
// // --------------------------------------------

// const storagePicture = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, pathGalleryPictures),
//   filename: (req, file, cb) => cb(null, req.pictureId.toString())
// });

// // -- GET PICTURE ------------------------------------------------------

// routes.get('/:galleryCategoryId/pictures', async (req, res, next) => {
//   const items = await models.GalleryPicture.findAll({
//     where: { galleryCategoryId: req.params.galleryCategoryId, visible: true },
//     order: ['num'],
//     attributes: ['id']
//   });

//   res.json({ items: items.map(({ id }) => id) });
// });


// // -- GET PICTURE PICTURE ------------------------------------------------------

// routes.get('/pictures/:pictureId', (req, res, next) => {
//   const fullPath = path.join(pathGalleryPictures, req.params.pictureId);

//   if (!fs.existsSync(fullPath)) return res.sendStatus(404);

//   return res.sendFile(fullPath);
// });

// // -- CREATE PICTURE ----------------------------------------------------

// const fileFilterCreatePicture = async (req, file, next) => {
//   if (!allowedTypes.includes(file.mimetype)) {
//     return next(new Error('LIMIT_FILE_TYPES'));
//   }

//   const category = await models.GalleryCategory.findOne({
//     where: { id: req.params.galleryCategoryId }, attributes: ['id']
//   });

//   if (!category) next(new Error('WRONG_PARAMS'));

//   const { num, visible } = req.body;

//   const picture = await category.createGalleryPicture({ num, visible });
//   req.pictureId = picture.id;

//   return next(null, true);
// };

// const uploadCreatePicture = multer({
//   fileFilter: fileFilterCreatePicture,
//   limits: { fileSize: process.env.APP_MAX_FILE_SIZE },
//   storage: storagePicture
// });

// const afterUploadCreatePicture = (req, res, next) => {
//   if (!req.file) next(new Error('MISSING_PARAMS'));
//   next();
// };

// routes.post(
//   '/:galleryCategoryId/pictures',
//   uploadCreatePicture.single('file'),
//   afterUploadCreatePicture,
//   (req, res) => res.json({ id: req.pictureId })
// );

// // -- UPDATE PICTURE ------------------------------------------------------

// const updatePicture = async (req, next) => {
//   const { id, galleryCategoryId } = req.params;
//   const { num, visible } = req.body;

//   let result = null;
//   if (num || visible) {
//     const picture = await models.GalleryPicture.update(
//       { num, visible }, { returning: true, where: { id, galleryCategoryId } }
//     );
//     ({ 0: result } = picture);
//   } else {
//     result = await models.GalleryPicture.findOne({
//       where: { id, galleryCategoryId }, attributes: ['id']
//     });
//   }

//   if (!result) return next(new Error('WRONG_PARAMS'));
//   req.pictureId = id;
//   return id;
// };

// const fileFilterUpdatePicture = async (req, file, next) => {
//   if (!allowedTypes.includes(file.mimetype)) {
//     return next(new Error('LIMIT_FILE_TYPES'));
//   }

//   await updatePicture(req, next);

//   return next(null, true);
// };

// const uploadUpdatePicture = multer({
//   fileFilter: fileFilterUpdatePicture,
//   limits: { fileSize: process.env.APP_MAX_FILE_SIZE },
//   storage: storagePicture
// });

// const afterUploadUpdatePicture = async (req, res, next) => {
//   if (!req.file) await updatePicture(req, next);
//   next();
// };

// routes.patch(
//   '/:galleryCategoryId/pictures/:id',
//   uploadUpdatePicture.single('file'),
//   afterUploadUpdatePicture,
//   (req, res) => res.json({ id: req.pictureId })
// );

// // -- DELETE PICTURE ------------------------------------------------------

// routes.delete(
//   '/:galleryCategoryId/pictures/:id',
//   async (req, res, next) => {
//     const { id, galleryCategoryId } = req.params;

//     await models.GalleryPicture.destroy({ where: { id, galleryCategoryId } });

//     try {
//       await fsPromises.unlink(path.join(pathGalleryPictures, id));
//     } catch (err) {
//       if (err.code !== 'ENOENT') return next(new Error(err));
//     }

//     return res.json({ id });
//   }
// );

module.exports = routes;
