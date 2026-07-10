const path = require("path");
const fs = require("fs");

// Diretório primário de logos: dentro do backend (persistido pelo volume
// backend_uploads no Docker) e servido pelo server.js em /uploads/logos.
const uploadsDir = path.join(__dirname, "../../uploads/logos");

// Diretórios do frontend usados no deploy legado (VPS sem Docker), onde o
// nginx serve /uploads/logos direto do dist. No Docker esses caminhos não
// existem no container do backend — a cópia é best-effort.
const legacyDirs = [
  path.join(__dirname, "../../../frontend/dist/uploads/logos"),
  path.join(__dirname, "../../../frontend/public/uploads/logos"),
];

if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

function copyToFrontendDirs(filePath, filename) {
  for (const dir of legacyDirs) {
    try {
      // Só copia se a árvore do frontend existir (deploy legado no mesmo filesystem)
      if (!fs.existsSync(path.dirname(path.dirname(dir)))) continue;
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
      fs.copyFileSync(filePath, path.join(dir, filename));
    } catch (e) {
      console.warn(`Cópia legada da logo falhou (${dir}): ${e.message}`);
    }
  }
}

module.exports = { uploadsDir, legacyDirs, copyToFrontendDirs };
