import { Injectable } from '@nestjs/common';
import {
  ConoHaObjectStorage,
  ObjectStorageAccount,
} from '@/utils/conoha-object-storage';
import * as config from 'config';
import { WriteStream } from 'fs';
import { AxiosResponse } from 'axios';

export interface Image {
  itemId: string;
  hash: string;
  last_modified: string;
  size: number;
  content_type: string;
}

@Injectable()
export class AppService {
  async getImages(): Promise<Image[]> {
    const cos = new ConoHaObjectStorage();
    const token = await cos.getToken({
      tenantName: config.get('conoha.tenantName'),
      username: config.get('conoha.username'),
      password: config.get('conoha.password'),
    });
    const images = await cos.getObjects({
      token,
      account: config.get('conoha.account') as ObjectStorageAccount,
      container: config.get('conoha.container'),
    });
    return images.map((image) => {
      return {
        itemId: image.name,
        hash: image.hash,
        last_modified: image.last_modified,
        size: image.bytes,
        content_type: image.content_type,
      };
    });
  }

  async getImage(filename: string): Promise<{
    statusCode: number;
    headers: AxiosResponse['headers'];
    stream: WriteStream;
  }> {
    const cos = new ConoHaObjectStorage();
    const token = await cos.getToken({
      tenantName: config.get('conoha.tenantName'),
      username: config.get('conoha.username'),
      password: config.get('conoha.password'),
    });
    return await cos.getObject({
      token,
      account: config.get('conoha.account') as ObjectStorageAccount,
      container: config.get('conoha.container'),
      filename,
    });
  }
}
