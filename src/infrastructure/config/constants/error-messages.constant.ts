/**
 * Error messages responses.
 */
export class ErrorMessages {
  public static SEGMENT_NOT_FOUND = 'Segment not found';

  public static INVALID_FILE_FORMAT = 'Invalid file format provided';

  public static NO_IMAGE_PROVIDED = 'Image was not provided';

  public static USER_NOT_FOUND = 'User not found';

  public static NO_AUTH_HEADER = 'Authentication header was not provided';

  public static NOT_OWNED = 'Segment is not owned';

  public static FORBIDDEN = 'You have not enough permissions for that action';

  public static NOT_MERGABLE = 'Segments is not mergable';

  public static ALREADY_MERGED = 'Some segments already merged';

  public static ALREADY_IN_GAME = 'User already in game';

  public static INVALID_COORDINATES = 'Invalid coordinates for merged segments was provided';

  public static BAD_POPULATION_UPDATE = 'Something went wrong, while population update';

  public static BAD_LANDS_FOR_SALE_UPDATE = 'Something went wrong, while lands for sale update';

  public static BAD_CURRENT_PRICE_UPDATE = 'Something went wrong, while current price update';

  public static BAD_SEGMENTS_OWNERS_UPDATE = 'Something went wrong, while segments owners update';

  public static BAD_LOG_TYPE = "Bad log type or it's missing some required data";

  public static CAVES_LIMIT = "Cave's limit was exceed on this segment";

  public static CAVE_ALREADY_EXISTS = 'Cave already exists at this segment';

  public static NOT_JOINED = "This user didn't join game yet";

  public static NOT_HOSTING = 'You have nothing to claim';

  public static NOT_ALLOWED = 'This method not allowed';

  public static NOT_ENOUGH_TOKENS = 'Sorry, you has not enough tokens for that action';

  public static TOKEN_NOT_FOUND = 'Token not found';

  public static BOTH_TOKENS_OWNED = 'Sorry, you cant play the game, because you are own both token types';
}
