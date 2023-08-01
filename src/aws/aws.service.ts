import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ConfigService } from '@nestjs/config';
import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
// import { SNS } from '@aws-sdk/client-sns';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { AWSFileType } from '../common/types';

export const generateUUID = () => {
  return uuidv4();
};

@Injectable()
export class AwsService {
  private readonly s3: S3Client;
  // private readonly sns: SNS;
  private readonly bucketName: string;
  private readonly logger: Logger = new Logger(AwsService.name);

  constructor(private readonly configService: ConfigService) {
    this.s3 = new S3Client({
      credentials: {
        accessKeyId: configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.getOrThrow<string>(
          'AWS_SECRET_ACCESS_KEY'
        ),
      },
      region: configService.getOrThrow<string>('AWS_S3_REGION'),
      apiVersion: '2006-03-01',
    });

    // this.sns = new SNS({
    //   credentials: {
    //     accessKeyId: this.configService.getOrThrow<string>('AWS_ACCESS_KEY_ID'),
    //     secretAccessKey: this.configService.getOrThrow<string>(
    //       'AWS_SECRET_ACCESS_KEY'
    //     ),
    //   },
    //   region: this.configService.getOrThrow<string>('AWS_S3_REGION'),
    //   apiVersion: '2010-03-31',
    // });

    this.bucketName =
      this.configService.getOrThrow<string>('AWS_S3_BUCKET_NAME');
  }

  async uploadMultipleFiles(
    path: string,
    userId: number,
    files: any
  ): Promise<AWSFileType[]> {
    const uploadFilesObj: AWSFileType[] = [];

    for (const item of files) {
      const fileName = `${path}/${userId}/${generateUUID()}_${item.originalname.replace(
        /\s/g,
        ''
      )}`;

      item.fileName = fileName;

      await this.s3
        .send(
          new PutObjectCommand({
            Bucket: this.bucketName,
            Key: `${fileName}`,
            Body: item.buffer,
            ContentType: item.mimetype,
            ACL: 'public-read',
          })
        )
        .catch((error: any) => {
          this.logger.error({ error });
        });

      uploadFilesObj.push(item);
    }

    return uploadFilesObj;
  }

  async uploadFile(
    path: string,
    userId: number,
    file: any
  ): Promise<AWSFileType> {
    const fileName = `${path}/${userId}/${generateUUID()}_${file.originalname.replace(
      /\s/g,
      ''
    )}`;

    file.fileName = fileName;

    await this.s3
      .send(
        new PutObjectCommand({
          Bucket: this.bucketName,
          Key: `${fileName}`,
          Body: file.buffer,
          ContentType: file.mimetype,
          ACL: 'public-read',
        })
      )
      .catch((error: any) => {
        this.logger.error({ error });
      });

    return file;
  }

  async deleteFile(fileName: string) {
    const result = await this.s3
      .send(
        new DeleteObjectCommand({
          Bucket: this.bucketName,
          Key: fileName,
        })
      )
      .catch((error: any) => {
        this.logger.error({ error });
      });

    return result;
  }

  async deleteMultipleFiles(fileNames: string[]) {
    const result = await Promise.all(
      fileNames.map(async (fileName) => {
        await this.s3
          .send(
            new DeleteObjectCommand({
              Bucket: this.bucketName,
              Key: fileName,
            })
          )
          .catch((error: any) => {
            console.error(error);
          });
      })
    );

    return result;
  }

  // async sendSMS(mobileNo: string, message: string) {
  //   const params = {
  //     Message: message,
  //     PhoneNumber: mobileNo,
  //   };

  //   return this.sns
  //     .publish(params)
  //     .then((message) => {
  //       this.logger.debug('OTP SENT SUCCESS', {message});
  //     })
  //     .catch((err) => {
  //       this.logger.debug('OTP SENT ERROR', {err});
  //     });
  // }

  async generateSignedUrl(path: string, fileType: string) {
    const command = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: path,
      ContentType: fileType,
      ACL: 'public-read',
    });

    const url = await getSignedUrl(this.s3, command, {
      expiresIn: 60 * 60 * 24,
    });

    return {
      url,
      file_path: path,
      cdn: this.configService.getOrThrow<string>('CDN_URL'),
    };
  }
}
