export interface Tag {
	id: number;
	tag_name: string;
	tag_content: string;
	author_id: string;
}

export const EARLY_RETURN_EXCEPTION = new Error('EARLY_RETURN_EXCEPTION');
