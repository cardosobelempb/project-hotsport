✅ Exemplo de uso com um arquivo simulado

```
import * as fs from 'fs';
import * as path from 'path';
import { FileVO } from './file.vo'; // ajuste o caminho conforme seu projeto

// Simulando upload de um arquivo PDF
const filePath = path.resolve(__dirname, 'assets', 'example.pdf'); // ajuste o nome
const buffer = fs.readFileSync(filePath);

const fileName = 'example.pdf';
const mimeType = 'application/pdf'; // em uma API, isso vem de req.file.mimetype

try {
  const file = new FileVO(fileName, mimeType, buffer);

  console.log('Arquivo válido!');
  console.log('Nome:', file.getName());
  console.log('Tamanho (bytes):', file.getSizeInBytes());
  console.log('Tipo MIME:', file.getMimeType());
} catch (err) {
  console.error('Erro ao validar arquivo:', err.message);
}

```
✅ Como seria em uma API NestJS com multer

```
@Post('upload')
@UseInterceptors(FileInterceptor('file'))
async upload(@UploadedFile() file: Express.Multer.File) {
  try {
    const validatedFile = new FileVO(
      file.originalname,
      file.mimetype,
      file.buffer,
    );

    // Prossiga com o arquivo validado
    return { message: 'Arquivo válido', size: validatedFile.getSizeInBytes() };
  } catch (err) {
    throw new BadRequestException('Arquivo inválido: ' + err.message);
  }
}

```

🧪 Dica
Você pode colocar esse FileVO na pasta domain/vo/file.vo.ts e usá-lo como parte do seu domínio, desacoplado do framework.

✅ Estrutura sugerida

```
src/
│
├── domain/
│   └── vo/
│       └── file.vo.ts
│
├── infrastruecture/
│   └── storage/
│       ├── local-storage.service.ts
│       ├── storage.service.ts (interface)
│       └── storage.module.ts
│
├── upload/
│   ├── upload.controller.ts
│   ├── upload.service.ts
│   └── upload.module.ts

```
✅ 1. Interface de armazenamento

```
// storage.service.ts
export interface StorageService {
  save(file: Buffer, fileName: string): Promise<string>;
}

```
✅ 2. Serviço de armazenamento local
```
// local-storage.service.ts
import { Injectable } from '@nestjs/common';
import { StorageService } from './storage.service';
import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';

const writeFile = util.promisify(fs.writeFile);

@Injectable()
export class LocalStorageService implements StorageService {
  private readonly uploadDir = path.resolve(__dirname, '../../../uploads');

  async save(file: Buffer, fileName: string): Promise<string> {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }

    const filePath = path.join(this.uploadDir, fileName);
    await writeFile(filePath, file);
    return filePath;
  }
}

```
✅ 3. Módulo de storage

```
// storage.module.ts
import { Module } from '@nestjs/common';
import { LocalStorageService } from './local-storage.service';
import { StorageService } from './storage.service';

@Module({
  providers: [{ provide: StorageService, useClass: LocalStorageService }],
  exports: [StorageService],
})
export class StorageModule {}

```

✅ 4. Serviço de upload

```
// upload.service.ts
import { Injectable } from '@nestjs/common';
import { StorageService } from '../infrastruecture/storage/storage.service';
import { FileVO } from '../domain/vo/file.vo';

@Injectable()
export class UploadService {
  constructor(private readonly storage: StorageService) {}

  async upload(file: Express.Multer.File): Promise<{ path: string }> {
    const validated = new FileVO(file.originalname, file.mimetype, file.buffer);
    const path = await this.storage.save(validated.getBuffer(), validated.getName());
    return { path };
  }
}

```
✅ 5. Controller

```
// upload.controller.ts
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async handleUpload(@UploadedFile() file: Express.Multer.File) {
    return await this.uploadService.upload(file);
  }
}

```

✅ 6. Módulo de upload

```
// upload.module.ts
import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { StorageModule } from '../infrastruecture/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}

```

🧪 Teste com curl:

```
curl -F "file=@example.pdf" http://localhost:3000/upload

```
