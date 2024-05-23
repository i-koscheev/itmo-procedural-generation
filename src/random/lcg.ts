// A linear congruential pseudorandom number generator (lcg).
// Based on W. Press, et al., Numerical Recipes in C (2d ed. 1992)
// By rgizz, gztown2216@yahoo.com, 2014

const MASK = 123459876;
const M = 2147483647;
const A = 16807;

/**
 * Генератор псевдорандомных чисел
 * @param seed Натуральное число
 */
export function lcg( seed?: number ): () => number {
	let value = seed || Date.now() % 100000000;
	
	return function lcg() {
		value = value ^ MASK;
		value = ( A * value ) % M;
		const rand = value / M;
		value = value ^ MASK;
		return rand;
	};
}