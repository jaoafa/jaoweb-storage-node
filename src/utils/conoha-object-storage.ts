import axios, { AxiosResponse } from 'axios';
import { WriteStream } from 'fs';

export type ConoHaToken = string;
export type ObjectStorageAccount = `nc_${string}`;

export interface ConoHaGetTokenAuth {
  tenantName: string;
  username: string;
  password: string;
}

export interface ConoHaGetObjectsOptions {
  token: ConoHaToken;
  account: ObjectStorageAccount;
  container: string;
}

export interface ConoHaGetObjectOptions {
  token: ConoHaToken;
  account: ObjectStorageAccount;
  container: string;
  filename: string;
}

export interface ConoHaObject {
  hash: string;
  last_modified: string;
  bytes: number;
  name: string;
  content_type: string;
}

export class ConoHaObjectStorage {
  public identityBaseUrl = 'https://identity.tyo1.conoha.io/v2.0/';
  public objectBaseUrl = 'https://object-storage.tyo1.conoha.io/v1';

  async getToken(auth: ConoHaGetTokenAuth): Promise<ConoHaToken> {
    const getTokenUrl = this.identityBaseUrl + 'tokens';
    const response = await axios.post(getTokenUrl, {
      auth: {
        tenantName: auth.tenantName,
        passwordCredentials: {
          username: auth.username,
          password: auth.password,
        },
      },
    });
    if (response.status !== 200) {
      throw new Error(`ConoHaObjectStorage-getToken: ${response.status}`);
    }
    return response.data.access.token.id as ConoHaToken;
  }

  async getObjects(options: ConoHaGetObjectsOptions): Promise<ConoHaObject[]> {
    const getObjectsUrl =
      this.objectBaseUrl + '/' + options.account + '/' + options.container;
    const response = await axios.get(getObjectsUrl, {
      headers: {
        Accept: 'application/json',
        'X-Auth-Token': options.token,
      },
    });
    if (response.status !== 200) {
      throw new Error(`ConoHaObjectStorage-getObjects: ${response.status}`);
    }
    return response.data as ConoHaObject[];
  }

  async getObject(options: ConoHaGetObjectOptions): Promise<{
    statusCode: number;
    headers: AxiosResponse['headers'];
    stream: WriteStream;
  }> {
    const getObjectUrl =
      this.objectBaseUrl +
      '/' +
      options.account +
      '/' +
      options.container +
      '/' +
      options.filename;

    const response = await axios
      .create({
        validateStatus: (status) =>
          (status >= 200 && status < 300) || status == 404,
      })
      .get<WriteStream>(getObjectUrl, {
        headers: {
          Accept: 'application/json',
          'X-Auth-Token': options.token,
        },
        responseType: 'stream',
      });
    return {
      statusCode: response.status,
      headers: response.headers,
      stream: response.data,
    };
  }
}
