/**
 * Выбор индекса, на основе случайного коэффициента.
 * 
 * @param array массив чисел
 * @param r случайное число от 0 до 1
 * @returns индекс, начиная с которого сумма идущих чисел превышает долю r от общей суммы
 */
export function randomIndex( array: Uint16Array, r: number ) {

	const sum = array.reduce(
		( result, item ) => result + item,
		0
	);

	r *= sum;

	if ( r === 0 ) {
		return 0;
	}

	let acc = 0;
	let i = 0;

	while ( i < array.length ) {
		acc += array[i];
		if ( r <= acc ) {
			return i;
		}
		i++;
	}
	return array.length - 1;
}
