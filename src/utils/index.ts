/**
 * Simple wait
 * @param delay Wait time in ms
 * @returns
 */
export async function wait(delay = 1000) {
	return new Promise((res) => setTimeout(res, delay));
}
