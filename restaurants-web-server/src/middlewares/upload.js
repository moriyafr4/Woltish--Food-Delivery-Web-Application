const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
 
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
  cb(null, path.join(__dirname, '../uploads/'));
 },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, crypto.randomUUID() + ext);
  }
});
 
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase())
               && allowedTypes.test(file.mimetype);
  if (isValid) cb(null, true);
  else cb(new Error('Only image files are allowed'));
};
 
const upload = multer({ storage, fileFilter });
 
module.exports = upload;