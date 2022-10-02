import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

import { v4 as uuidv4 } from 'uuid';

export const generateUUID = () => {
  return uuidv4();
};

@Injectable()
export class AWSService {
  private s3: any;
  constructor() {
    this.s3 = new AWS.S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      apiVersion: '2006-03-01',
      signatureVersion: 'v4',
    });
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
        Bucket: process.env.AWS_S3_BUCKET_NAME || '',
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
        Bucket: process.env.AWS_S3_BUCKET,
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
        Bucket: process.env.AWS_S3_BUCKET,
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

    return new AWS.SNS({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
      apiVersion: '2010-03-31',
    })
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
