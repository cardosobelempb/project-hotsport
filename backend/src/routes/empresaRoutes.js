const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/authorize");
const tenant = require("../middleware/tenant");
const checkPermissao = require("../middleware/checkPermissao");
const multer = require("multer");
const path = require("path");
const {
  listarEmpresas,
  criarEmpresa,
  atualizarEmpresa,
  deletarEmpresa,
  obterEmpresa,
  listarAdminsEmpresa,
  vincularAdmin,
  desvincularAdmin,
  listarTodosAdmins,
  obterPerfilEmpresa,
  atualizarPerfilEmpresa,
} = require("../controllers/empresaController");
const db = require("../../db");

function somenteGestores(req, res, next) {
  if (!['super_admin', 'owner', 'manager'].includes(req.user.role)) {
    return res.status(403).json({ message: "Permissão insuficiente" });
  }
  next();
}

// Multer para upload de logo
// Armazenamento primário: backend/uploads/logos (persistido pelo volume backend_uploads
// no Docker e servido estaticamente pelo server.js em /uploads/logos).
// Cópia best-effort pros diretórios do frontend (deploy legado VPS sem Docker,
// onde o nginx serve /uploads/logos direto do dist).
const { uploadsDir, copyToFrontendDirs } = require('../utils/logoUpload');

const storage = multer.diskStorage({
  destination: uploadsDir,
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `empresa-${req.params.id || req.empresa_id}-${Date.now()}${ext}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 }, fileFilter: (req, file, cb) => {
  if (/^image\/(jpeg|png|gif|webp|svg\+xml)$/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Apenas imagens são permitidas'));
}});

// Rota com auth (não precisa ser super_admin): buscar empresa por slug (sidebar)
router.get("/by-slug/:slug", auth, async (req, res) => {
  try {
    const [[empresa]] = await db.execute('SELECT id, nome, slug, logo_url, descricao FROM empresas WHERE slug = ?', [req.params.slug]);
    if (!empresa) return res.status(404).json({ message: "Empresa não encontrada" });
    res.json(empresa);
  } catch (err) {
    res.status(500).json({ message: "Erro" });
  }
});

// Perfil da própria empresa (owner/manager, não requer super_admin) — usa req.empresa_id, não :id
router.get("/perfil", auth, tenant, checkPermissao('configuracoes'), somenteGestores, obterPerfilEmpresa);
router.put("/perfil", auth, tenant, checkPermissao('configuracoes'), somenteGestores, atualizarPerfilEmpresa);
router.post("/perfil/logo", auth, tenant, checkPermissao('configuracoes'), somenteGestores, upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Nenhum arquivo enviado" });
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    copyToFrontendDirs(req.file.path, req.file.filename);
    await db.execute('UPDATE empresas SET logo_url = ? WHERE id = ?', [logoUrl, req.empresa_id]);
    res.json({ logo_url: logoUrl });
  } catch (err) {
    console.error('Erro upload logo do perfil:', err);
    res.status(500).json({ message: "Erro ao fazer upload" });
  }
});

// Todas as rotas abaixo requerem super_admin
router.use(auth, authorize('super_admin'));

router.get("/", listarEmpresas);
router.post("/", criarEmpresa);
router.get("/admins/todos", listarTodosAdmins);
router.get("/:id", obterEmpresa);
router.put("/:id", atualizarEmpresa);
router.delete("/:id", deletarEmpresa);

// Upload de logo
router.post("/:id/logo", upload.single('logo'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Nenhum arquivo enviado" });
    const logoUrl = `/uploads/logos/${req.file.filename}`;
    copyToFrontendDirs(req.file.path, req.file.filename);
    await db.execute('UPDATE empresas SET logo_url = ? WHERE id = ?', [logoUrl, req.params.id]);
    res.json({ logo_url: logoUrl });
  } catch (err) {
    console.error('Erro upload logo:', err);
    res.status(500).json({ message: "Erro ao fazer upload" });
  }
});

// Vinculação admin <-> empresa
router.get("/:id/admins", listarAdminsEmpresa);
router.post("/:id/vincular-admin", vincularAdmin);
router.delete("/:id/desvincular-admin/:adminId", desvincularAdmin);

module.exports = router;
