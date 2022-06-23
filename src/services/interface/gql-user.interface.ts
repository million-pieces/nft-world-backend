import { IGQLSegment } from './gql-segment.interface';

export class IGQLUser {
  id: string;

  tokens: IGQLSegment[];
}
