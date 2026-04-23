
# ✅ Passo 2: Implementação com múltiplos arquivos, validação e subpastas
```
// infrastructure/storage/MinioUploader.ts

import { Uploader, UploadedFile } from '../../core/contracts/Uploader';
import { Request } from 'express';
import multer from 'multer';
import { minioClient } from '../../config/minioClient';
import { randomUUID } from 'crypto';
import path from 'path';

const BUCKET_NAME = 'uploads';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];

export class MinioUploader extends Uploader {
  private uploader = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: MAX_FILE_SIZE },
    fileFilter: (_, file, cb) => {
      if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        return cb(new Error('Tipo de arquivo não permitido'));
      }
      cb(null, true);
    },
  }).array('files', 10); // permite até 10 arquivos

  async upload(req: Request, folder = ''): Promise<UploadedFile[]> {
    return new Promise((resolve, reject) => {
      this.uploader(req, {} as any, async (err) => {
        if (err) return reject(err);
        const files = req.files as Express.Multer.File[];
        if (!files || files.length === 0) return reject(new Error('Nenhum arquivo enviado'));

        try {
          const exists = await minioClient.bucketExists(BUCKET_NAME);
          if (!exists) {
            await minioClient.makeBucket(BUCKET_NAME, 'us-east-1');
          }

          const uploadedFiles: UploadedFile[] = [];

          for (const file of files) {
            const fileExt = path.extname(file.originalname);
            const uniqueName = `${randomUUID()}${fileExt}`;
            const objectPath = path.join(folder, uniqueName).replace(/\\/g, '/'); // cross-platform

            await minioClient.putObject(BUCKET_NAME, objectPath, file.buffer, {
              'Content-Type': file.mimetype,
            });

            const url = `${req.protocol}://${req.headers.host}/${BUCKET_NAME}/${objectPath}`;

            uploadedFiles.push({
              originalName: file.originalname,
              mimeType: file.mimetype,
              size: file.size,
              path: objectPath,
              url,
            });
          }

          resolve(uploadedFiles);
        } catch (e) {
          reject(e);
        }
      });
    });
  }

  async delete(filePath: string): Promise<void> {
    try {
      await minioClient.removeObject(BUCKET_NAME, filePath);
    } catch (err) {
      console.error('Erro ao deletar arquivo:', err);
    }
  }
}

```

# ✅ Passo 3: Rota de upload para múltiplos arquivos
```
 // routes/upload.ts
import { Router } from 'express';
import { MinioUploader } from '../infrastructure/storage/MinioUploader';

const router = Router();
const uploader = new MinioUploader();

router.post('/upload', async (req, res) => {
  try {
    // Exemplo: colocar em subpasta "users/"
    const uploadedFiles = await uploader.upload(req, 'users');
    res.status(201).json(uploadedFiles);
  } catch (err: any) {
    console.error(err);
    res.status(400).json({ error: err.message });
  }
});

export default router;

```
# ✅ Exemplo de requisição no Frontend (com FormData)
```
const formData = new FormData();
formData.append('files', file1);
formData.append('files', file2);

fetch('/upload', {
  method: 'POST',
  body: formData,
})
  .then(res => res.json())
  .then(console.log)
  .catch(console.error);

```

# 🧼 Bônus: TTL automático no MinIO (expiração)

```
Para objetos expirarem automaticamente, você precisa criar uma política de expiração de bucket no MinIO (via client mc, API ou interface web).

Exemplo com mc CLI:
mc ilm add myminio/uploads --expire-days 30

✅ Resultado

Upload de múltiplos arquivos

Validação de tipo e tamanho

Organização por subpastas

URLs acessíveis

Pode ser trocado por S3 sem mudar o contrato
```
