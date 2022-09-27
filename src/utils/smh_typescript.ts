export function i_solemnly_swear_it_is_not_null<T>(
	t: T,
): asserts t is NonNullable<T> {}
