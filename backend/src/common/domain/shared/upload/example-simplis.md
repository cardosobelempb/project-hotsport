# infrastructure/storage/MulterDiskUploader.ts

```
import { UploadAbstract, UploadedFile } from '../../core/contracts/UploadAbstract';
import { Request } from 'express';
import multer, { StorageEngine } from 'multer';
import fs from 'fs/promises';
import path from 'path';
import { randomUUID } from 'crypto';

export class MulterDiskUploader extends UploadAbstract {
  private uploadDir = path.resolve(__dirname, '../../../uploads');

  private storage: StorageEngine = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, this.uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueName = `${randomUUID()}-${file.originalname}`;
      cb(null, uniqueName);
    },
  });

  private uploader = multer({ storage: this.storage }).single('file');

  public upload(req: Request): Promise<UploadedFile> {
    return new Promise((resolve, reject) => {
      this.uploader(req, {} as any, (err) => {
        if (err) {
          return reject(err);
        }

        const file = req.file;

        if (!file) {
          return reject(new Error('No file provided'));
        }

        const uploaded: UploadedFile = {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          path: file.path,
        };

        resolve(uploaded);
      });
    });
  }

  public async delete(filePath: string): Promise<void> {
    try {
      await fs.unlink(filePath);
    } catch {
      // Ignorar se o arquivo não existir
    }
  }
}

```


# ✅ 3. Uso no Controller
```
 // routes/upload.ts
import { Router } from 'express';
import { MulterDiskUploader } from '../infrastructure/storage/MulterDiskUploader';

const router = Router();
const uploader = new MulterDiskUploader();

router.post('/upload', async (req, res) => {
  try {
    const uploaded = await uploader.upload(req);
    res.status(200).json(uploaded);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Upload failed' });
  }
});

export default router;

```

# 📦 Dica: Criar a pasta de upload, se não existir

```
Você pode adicionar no construtor da MulterDiskUploader:
 constructor() {
  super();
  fs.mkdir(this.uploadDir, { recursive: true }).catch(() => {});
}

```
