export const undefined_on_error = async <T>(promise: Promise<T>) => {
	try {
		return await promise;
	} catch {
		return undefined;
	}
};

export const no_op = () => {};
