// todo enable verbatim module syntax
import Pocketbase, { type RecordService } from 'pocketbase';
import 'dotenv/config';

export const pb = new Pocketbase(
	process.env['POCKETBASE_URL']!,
) as TypedPocketbase;

await pb.admins.authWithPassword(
	process.env['POCKETBASE_ADMIN_EMAIL']!,
	process.env['POCKETBASE_ADMIN_PASSWORD']!,
);

interface BaseModel {
	id: string;
	created: string;
	updated: string;
}

interface TagsCollection extends BaseModel {
	author_id: string;
	/** Should be lowercase & between 1-255 chars */
	name: string;
	content: string;
}

interface TypedPocketbase extends Pocketbase {
	collection(idOrName: 'tags'): RecordService<TagsCollection>;
}
