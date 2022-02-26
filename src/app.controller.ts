import { Controller, Get, Param } from '@nestjs/common';
import { AppService, Image } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getImages(): Image[] {
    return this.appService.getImages();
  }

  @Get(':filename.json')
  getImageData(@Param('filename') filename: string): string {
    return this.appService.getImageData(filename);
  }

  @Get(':filename')
  getImage(@Param('filename') filename: string): string {
    return this.appService.getImage(filename);
  }
}
