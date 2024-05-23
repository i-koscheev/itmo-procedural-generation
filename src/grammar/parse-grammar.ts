import type { LineElement } from './build';
import type { Word } from './words';

export function parseGrammar( input: string ) {

	const lineConfig: LineElement[] = [];
	const array = input + ',';

	let i = 0;
	let j = 0;
	let current: Partial<LineElement> = {
		priority: 0,
	};
	let mode: 'w' | 'p' | 'c' | 'n' = 'w';

	const end = () => {
		let str = input.substring( i, j );
		str = str.replace( /\s/g, '' );
		switch( mode ) {
		case 'w':
			if ( str === '' ) {
				break;
			}
			if ( current.words === undefined ) {
				current.words = str as Word;
			} else {
				if ( typeof current.words === 'string' ) {
					current.words = [current.words, str as Word];
				} else {
					current.words.push( str as Word );
				}
			}
			break;

		case 'p':
			if ( str !== '' ) {
				current.priority = parseInt( str );
			}
			break;

		case 'c':
			if ( str === '' ) {
				current.count = 1;
				current.repeat = true;
			}
			current.count = parseInt( str );
			break;
		default:
			break;
		}
		j++;
		i = j;
	};

	while ( i < array.length ) {
	
		switch( array[j] ) {
	
		case '&':
			end();
			mode = 'w';
			break;

		case '*':
			end();
			mode = 'c';
			break;

		case '~':
			end();
			current.stretch = true;
			mode = 'n';
			break;

		case '<':
			end();
			mode = 'p';
			break;
			
		case '>':
			end();
			mode = 'n';
			break;
		
		case ',':
			end();
			if ( current.count === undefined  )
			{
				current.count = current.stretch ? 0 : 1;
			}
			if ( current.words !== undefined ) {
				lineConfig.push( { ...current } as LineElement );
			}
			current = { priority: 0 };
			mode = 'w';
			break;
	
		default:
			j++;
		}
		
	}

	return lineConfig;
}