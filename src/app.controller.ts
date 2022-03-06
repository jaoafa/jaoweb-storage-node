import { Controller, Get, Param, Res, Response } from '@nestjs/common';
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import { AppService, Image } from './app.service';
import { redirect_files } from './utils/redirect_files';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getImages(): Promise<Image[]> {
    return await this.appService.getImages();
  }

  @Get(':filename')
  async getImage(
    @Param('filename') filename: string,
    @Response({ passthrough: true }) res,
    @Res() response,
  ): Promise<void> {
    if (filename === 'favicon.ico') {
      response.status(404).send();
      return;
    }
    if (redirect_files[filename] !== undefined) {
      response.redirect(301, `/${redirect_files[filename]}`);
      return;
    }

    const result = await this.appService.getImage(filename);

    if (result.statusCode !== 200) {
      response.status(result.statusCode).send();
      return;
    }

    if (!existsSync('./caches/')) {
      mkdirSync('./caches');
    }

    const cacheFilePath = './caches/' + filename;

    if (existsSync(cacheFilePath + '.json')) {
      const prevJson = readFileSync(cacheFilePath + '.json', 'utf8');
      const prev = JSON.parse(prevJson);
      if (result.headers['last-modified'] === prev['last-modified']) {
        const readStream = createReadStream(cacheFilePath);
        readStream.pipe(res);
        await new Promise((resolve, reject) => {
          readStream.on('error', reject);
          readStream.on('end', resolve);
        });
        return;
      }
    }
    writeFileSync(cacheFilePath + '.json', JSON.stringify(result.headers));

    const writeStream = createWriteStream(cacheFilePath);
    result.stream.pipe(writeStream);

    writeStream.on('finish', () => {
      const readStream = createReadStream(cacheFilePath);
      readStream.pipe(res);
    });

    await new Promise((resolve, reject) => {
      writeStream.on('error', reject);
      writeStream.on('end', resolve);
    });
  }
}
