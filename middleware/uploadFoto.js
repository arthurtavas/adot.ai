const multer = require('multer');
const HttpError = require('../utils/httpError');

const TAMANHO_MAXIMO = 5 * 1024 * 1024; // 5 MB
const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png'];

const upload = multer({
  storage: multer.memoryStorage(), // o arquivo só é gravado em disco depois de validado (utils/fotos.js)
  limits: { fileSize: TAMANHO_MAXIMO, files: 1 },
  fileFilter(req, file, cb) {
    if (TIPOS_PERMITIDOS.includes(file.mimetype)) return cb(null, true);
    cb(new HttpError(400, 'Formato inválido. Envie uma imagem JPEG ou PNG.'));
  },
});

/** Recebe o campo de arquivo "foto" (opcional) e deixa o arquivo em req.file. */
function uploadFoto(req, res, next) {
  upload.single('foto')(req, res, (err) => {
    if (!err) return next();

    if (err instanceof multer.MulterError) {
      const mensagem = err.code === 'LIMIT_FILE_SIZE'
        ? 'A imagem deve ter no máximo 5 MB.'
        : 'Erro ao enviar a imagem.';
      return next(new HttpError(400, mensagem));
    }
    next(err);
  });
}

module.exports = uploadFoto;
