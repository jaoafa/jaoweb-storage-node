import { Injectable } from '@nestjs/common';

export interface Image {
  itemId: string;
  hash: string;
  last_modified: string;
  size: number;
  content_type: string;
}

@Injectable()
export class AppService {
  getImages(): Image[] {
    return [];
  }

  getImage(filename: string): string {
    return filename;
  }

  getImageData(filename: string) {
    return filename + ' data';
  }
}
