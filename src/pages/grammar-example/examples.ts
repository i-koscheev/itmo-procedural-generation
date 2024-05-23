import { parseGrammar } from '../../grammar/parse-grammar';

export const line1 = parseGrammar( 'Wall~, Panoramic*, Panoramic*2<0>, Door*2<1>, Panoramic*2<2>, Panoramic*, Wall~' );

export const line2 = parseGrammar( 'Wall~, Window*, Window*2<0>, Small&Window&Small<1>, Window*2<2>, Window*, Wall~' );

