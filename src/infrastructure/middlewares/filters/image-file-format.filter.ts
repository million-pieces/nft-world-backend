import { BadRequestException } from '@nestjs/common';
import { ErrorMessages } from '../../config/constants/error-messages.constant';

/**
 * Middleware to check form-data image files folder.
 * Prevents non-image files upload.
 *
 * @param req express request object
 * @param file express multer file object
 * @param callback callback function
 * @returns NestJS exception if wring format, or continue request
 *
 * @see {@link http://expressjs.com/en/resources/middleware/multer.html Multer}
 */
export const imageFileFormatFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(png|svg|jpg|jpeg)$/)) {
    return callback(
      new BadRequestException(ErrorMessages.INVALID_FILE_FORMAT),
      false,
    );
  }
  return callback(null, true);
};
