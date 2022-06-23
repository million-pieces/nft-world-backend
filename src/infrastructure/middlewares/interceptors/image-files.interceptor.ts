import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { MulterField } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import dotenv from 'dotenv';

import { diskStorage } from 'multer';
import { extname } from 'path';
import * as uuid from 'uuid';

import { ImageFileFolder } from '../../config/enum/image-file-folder.enum';

import { imageFileFormatFilter } from '../filters/image-file-format.filter';

dotenv.config({ path: `.${process.env.NODE_ENV}.env` });

const editFileName = (req, file, callback) => {
  const fileExtName = extname(file.originalname);

  const guid = uuid.v4();
  const currentDate = new Date().toISOString();

  callback(null, `${guid}-${currentDate}${fileExtName}`);
};

/**
 * Middleware which upload form-data files on disk.
 *
 * @param fieldName form-data field name, where image file will be exists.
 * @param dest image file upload destination
 *
 * @remarks {@link ImageFileFolder Destination} is enum. Directories are set in .env files.
 * Then they concat with ./public directory in switch-case statement.
 *
 * @see {@link https://docs.nestjs.com/techniques/file-upload NestJS file upload}
 */
export const ImageFilesInterceptor = (fieldName: MulterField[], dest: ImageFileFolder) => {
  let destination = './public/';

  switch (dest) {
    case ImageFileFolder.SEGMENT_IMAGES:
      destination = destination.concat(process.env.SEGMENT_IMAGES_FOLDER);
      break;

    case ImageFileFolder.MERGED_SEGMENT_IMAGES:
      destination = destination.concat(process.env.MERGED_SEGMENT_IMAGES_FOLDER);
      break;

    case ImageFileFolder.AVATAR_IMAGES:
      destination = destination.concat(process.env.USER_AVATAR_FOLDER);
      break;

    default:
      destination = destination.concat('files');
      break;
  }

  return FileFieldsInterceptor(fieldName, {
    storage: diskStorage({
      destination,
      filename: editFileName,
    }),
    limits: {
      fileSize: 2000000,
    },
    fileFilter: imageFileFormatFilter,
  });
};
