'use strict';

const routes = require('express').Router();
const models = require('../models');

// -- GET CATEGORY ------------------------------------------------------

routes.get('', async (req, res) => {
  const cartridges = await models.Cartridge.findAll({
    order: ['id'],
    attributes: ['id', 'code', 'quantity', 'balance', 'active', 'lastActive', 'lastDevice']
  });

  res.json({ items: cartridges });
});

// -- CREATE CATEGORY ------------------------------------------------------

routes.post('', async (req, res, next) => {
  const { code, quantity, active } = req.body;
  if (!code) next(new Error('MISSING_PARAMS'));

  const cartridge = await models.Cartridge.create({
    code, quantity, active
  });
  res.json({ id: cartridge.id });
});


// -- GET CATEGORY PICTURE ------------------------------------------------------

// routes.get('/categories/:id', async (req, res, next) => {
//   const result = await models.Cartridge.findOne({ where: { id }, attributes: ['id'] });
//   res.sendFile(result);
// });


// // -- UPDATE CATEGORY ------------------------------------------------------

// const updateCategory = async (req, next) => {
//   const { id } = req.params;
//   const { num, visible, name } = req.body;

//   let result = null;
//   if (num || visible || name) {
//     const category = await models.GalleryCategory.update(
//       { num, visible, name }, { returning: true, where: { id } }
//     );
//     ({ 0: result } = category);
//   } else {
//     result = await models.GalleryCategory.findOne({ where: { id }, attributes: ['id'] });
//   }

//   if (!result) return next(new Error('WRONG_PARAMS'));
//   req.categoryId = id;
//   return id;
// };

// const fileFilterUpdateCategory = async (req, file, next) => {
//   if (!allowedTypes.includes(file.mimetype)) {
//     return next(new Error('LIMIT_FILE_TYPES'));
//   }

//   await updateCategory(req, next);

//   return next(null, true);
// };

// const uploadUpdateCategory = multer({
//   fileFilter: fileFilterUpdateCategory,
//   limits: { fileSize: process.env.APP_MAX_FILE_SIZE },
//   storage: storageCategory
// });

// const afterUploadUpdateCategory = async (req, res, next) => {
//   if (!req.file) await updateCategory(req, next);
//   next();
// };

// routes.patch(
//   '/:id',
//   uploadUpdateCategory.single('file'),
//   afterUploadUpdateCategory,
//   (req, res) => res.json({ id: req.categoryId })
// );

// // -- DELETE CATEGORY ------------------------------------------------------

// routes.delete(
//   '/:id',
//   async (req, res, next) => {
//     const { id } = req.params;

//     await models.GalleryCategory.destroy({ where: { id } });

//     try {
//       await fsPromises.unlink(path.join(pathGalleryCategories, id));
//     } catch (err) {
//       if (err.code !== 'ENOENT') return next(new Error(err));
//     }

//     return res.json({ id });
//   }
// );

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
