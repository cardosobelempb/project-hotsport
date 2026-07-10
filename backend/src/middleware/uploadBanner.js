const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const UPLOAD_ROOT = path.join(__dirname, "../../uploads/banners");

const ALLOWED_MIMES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // req.empresa_id vem do middleware tenant (cadeia protegida)
    const dir = path.join(UPLOAD_ROOT, String(req.empresa_id));
    fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = ALLOWED_MIMES[file.mimetype] || path.extname(file.originalname).toLowerCase();
    cb(null, uuidv4() + ext);
  },
});

function fileFilter(req, file, cb) {
  if (ALLOWED_MIMES[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error("Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF."));
  }
}

const uploadBanner = multer({
  storage,
  fileFilter,
  limits: { fileSize: MAX_IMAGE_BYTES },
});

module.exports = { uploadBanner, ALLOWED_MIMES, MAX_IMAGE_BYTES, UPLOAD_ROOT };
