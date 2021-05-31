import { mediaMatches } from '../../.dynamic/media-match/media-match';
import { MediaQueryService } from '@fastkit/vue-media-match';

export const mediaQueryService = new MediaQueryService(mediaMatches);
