import type { Word } from './words';
import { WORDS } from './words';

export type LineElement = {
	words: Word | Word[];
	priority: number;
	/** 0 может быть только для stretch */
	count: number;
	repeat?: boolean;
	stretch?: boolean;
}

type PriorityListInfo = {
	pending: number;
	stretchable: number[];
}

type StalemateState = {
	index: number;
	space: number;
}

type PieceInfo = {
	word: Word;
	position: number;
	scale: number;
}

function getWidth( param: Word | Word[] ) {
	if ( typeof param === 'string' ) {
		return WORDS[ param ].width;
	}
	let sum = 0;
	for ( const word of param ) {
		sum = sum + WORDS[ word ].width;
	}
	return sum;
}

export function build( length: number, elements: LineElement[] ) {
	const waitingList = new Map<number, PriorityListInfo>;

	const states = elements.map( ( element, index ) => {
		const priority = element.priority;
		if ( !waitingList.has( priority ) ) {
			const info = {
				pending: element.repeat ? -1 : element.count,
				stretchable: element.stretch ? [index] : [],
			};
			waitingList.set( priority, info );
		} else {
			const current = waitingList.get( priority )!;
			if ( current.pending >= 0 ) {
				if ( element.repeat ) {
					current.pending = -1;
				} else {
					current.pending = current.pending + element.count;
				}
			}
			if ( element.stretch ) {
				current.stretchable = [...current.stretchable, index];
			}
		}
		return {
			count: 0,
			scale: 1,
		};
	} );

	const priorities = [...waitingList]
		.map( ( [ p, _ ] ) => p )
		.sort( ( a, b ) => ( b - a ) );

	let space = length;
	for ( const priority of priorities ) {
		const current = waitingList.get( priority )!;
		let i = elements.findIndex( ( e ) => ( e.priority === priority ) );

		let stalemate: StalemateState | undefined = undefined;
		while ( space > 0 && current.pending !== 0 ) {
			// располагаем по 1 элементу
			if ( elements[i].repeat || elements[i].count > states[i].count ) {
				const w = getWidth( elements[i].words );
				// проверяем помещается ли текущий
				if ( space >= w ) {
					space = space - w;
					states[i].count = states[i].count + 1;
					current.pending = current.pending - 1;
				} else {
					// если не поместился (впервые), запоминаем позицию
					if ( stalemate === undefined ) {
						stalemate = {
							index: i,
							space: space
						};
					} else {
						// когда круг замкнётся, и ни один новый элемент
						// так и не удалось разместить, выходим
						if ( stalemate.index === i ) {
							if ( stalemate.space === space ) {
								break;
							} else {
								stalemate.space = space;
							}
						}
					}
				}
			}
			// переходим к следующему элементу
			i++;
			while ( i < elements.length && elements[i].priority !== priority ) {
				i++;
			}
			if ( i === elements.length ) {
				i = 0;
				while ( elements[i].priority !== priority ) {
					i++;
				}
			}
		}

		if ( space > 0 && current.stretchable.length > 0 ) {

			// после размещаем растяжимые
			let stretchableNumber = 0;
			for ( const idx of current.stretchable ) {
				if ( states[idx].count !== 0 ) {
					stretchableNumber = stretchableNumber + states[idx].count;
				} else {
					stretchableNumber++;
				}
			}
			const step = space / stretchableNumber;
			for ( const idx of current.stretchable ) {
				const w = getWidth( elements[idx].words );
				if ( states[idx].count === 0 ) {
					states[idx].count = 1;
					states[idx].scale = step / w;
				} else {
					states[idx].scale = 1 + step / w;
				}
			}

			space = 0;
		}
	}

	const pieces: PieceInfo[] = [];
	let next = 0;
	for( let i = 0; i < states.length; i++ ) {
		const w = getWidth( elements[i].words );
		for( let j = 0; j < states[i].count; j++ ) {
			const param = elements[i].words;
			if ( typeof param === 'string' ) {
				pieces.push( {
					word: param,
					position: next,
					scale: states[i].scale,
				} );
				next = next + states[i].scale * w;
			} else {
				for ( const word of param ) {
					pieces.push( {
						word,
						position: next,
						scale: states[i].scale,
					} );
					next = next + states[i].scale * WORDS[ word ].width;
				}
			}
		}
	}

	return pieces;
}
