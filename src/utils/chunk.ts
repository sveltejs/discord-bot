/**
 * Splits an array into chunks of a specified size.
 * @param {T[]} arr The array to split.
 * @param {number} size The size of each chunk.
 * @returns {T[][]} An array of arrays, each containing elements of the original array.
 */
export function chunk_array<T>(arr: T[], size: number): T[][] {
	const chunks: T[][] = [];
	for (let i = 0; i < arr.length; i += size) {
		chunks.push(arr.slice(i, i + size));
	}
	return chunks;
}
