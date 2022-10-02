import { Controller, Post, UploadedFile, UploadedFiles } from '@nestjs/common';
import {
  ApiFileFields,
  ApiFiles,
  ApiImageFile,
  ApiPdfFile,
} from '../common/decorators';
import { ParseFile } from '../common/pipes';
import { FileService } from './file.service';

@Controller('file')
export class FileController {
  constructor(private readonly fileService: FileService) {}

  @Post('avatar')
  @ApiImageFile('avatar', true)
  uploadAvatar(@UploadedFile(ParseFile) file: Express.Multer.File) {
    console.log(file);
  }

  @Post('document')
  @ApiPdfFile('document', true)
  uploadDocument(@UploadedFile(ParseFile) file: Express.Multer.File) {
    console.log(file);
  }

  @Post('uploads')
  @ApiFiles('files', true)
  uploadFiles(@UploadedFiles(ParseFile) files: Array<Express.Multer.File>) {
    console.log(files);
  }

  @Post('uploadFields')
  @ApiFileFields([
    { name: 'avatar', maxCount: 1, required: true },
    { name: 'background', maxCount: 1 },
  ])
  uploadMultipleFiles(@UploadedFiles() files: Express.Multer.File[]) {
    console.log(files);
  }
}
