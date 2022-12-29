import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';

import { v4 as uuidv4 } from 'uuid';

export const generateUUID = () => {
  return uuidv4();
};

@Injectable()
export class AWSService {
  private readonly s3: any;
  private readonly sns: any;
  private readonly bucketName: string;

  constructor(private readonly configService: ConfigService) {
    this.s3 = new AWS.S3({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_S3_REGION'),
      apiVersion: '2006-03-01',
      signatureVersion: 'v4',
    });

    this.sns = new AWS.SNS({
      accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
      secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      region: this.configService.get<string>('AWS_S3_REGION'),
      apiVersion: '2010-03-31',
    });

    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME');
  }

  async uploadMultipleFiles(userId: number, files: any) {
    const uploadFilesObj: any = [];

    for (const item of files) {
      const fileName = `${userId}/${generateUUID()}_${item.originalname.replace(
        /\s/g,
        '',
      )}`;

      item.fileName = fileName;
      item.mimetype = item.mimetype;

      const params = {
        Bucket: this.bucketName,
        Key: `${fileName}`,
        Body: item.buffer,
        ContentType: item.mimetype,
        ACL: 'public-read',
      };

      await this.s3
        .upload(params)
        .promise()
        .catch((error) => {
          console.error(error);
        });

      uploadFilesObj.push(item);
    }

    return uploadFilesObj;
  }

  async uploadFile(dataBuffer: Buffer, fileName: string, mimeType: string) {
    const result = await this.s3
      .upload({
        Bucket: this.bucketName,
        Key: fileName,
        Body: dataBuffer,
        ContentType: mimeType,
        ACL: 'public-read',
      })
      .promise();

    return result;
  }

  async deleteFile(fileName: string) {
    const result = await this.s3
      .deleteObject({
        Bucket: this.bucketName,
        Key: fileName,
      })
      .promise();

    return result;
  }

  async sendSMS(mobileNo: string, message: string) {
    const params = {
      Message: message,
      PhoneNumber: mobileNo,
    };

    return this.sns
      .publish(params)
      .promise()
      .then((message) => {
        console.log('OTP SENT SUCCESS', message);
      })
      .catch((err) => {
        console.log('OTP SENT ERROR', err);
      });
  }
}
