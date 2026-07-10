const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/portalController");

const multer = require("multer");
const path = require("path");

const { uploadsDir, copyToFrontendDirs } = require('../utils/logoUpload');

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `portal-${req.params.id}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (/^image\/(jpeg|png|gif|webp|svg\+xml)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Apenas imagens são permitidas'));
}});

// Cópia best-effort pros diretórios do frontend (deploy legado sem Docker)
const copyToPublic = (req, res, next) => {
  if (req.file) copyToFrontendDirs(req.file.path, req.file.filename);
  next();
};

router.get("/", ctrl.listarPortais);
router.post("/", ctrl.criarPortal);
router.put("/:id", ctrl.atualizarPortal);
router.delete("/:id", ctrl.deletarPortal);
router.get("/:id/preview", ctrl.previewPortal);
router.post("/:id/logo", upload.single('logo'), copyToPublic, ctrl.uploadLogo);
router.get("/:portalId/campanha", ctrl.listarCampanhasVinculadas);
router.put("/:portalId/campanha", ctrl.vincularCampanha);
router.post("/:id/whatsapp-preview", ctrl.whatsappPreview);
router.post("/:id/whatsapp-teste", ctrl.whatsappTeste);

module.exports = router;
