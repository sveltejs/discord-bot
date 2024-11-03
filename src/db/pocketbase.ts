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

interface ThreadSolvesCollection extends BaseModel {
	user_id: string;
	count: number;
}

interface AnalyticsCollection extends BaseModel {
	member_count: number;
	presence_count: number;
}

type LeaderboardView = Pick<ThreadSolvesCollection, 'id' | 'user_id' | 'count'>;

interface TypedPocketbase extends Pocketbase {
	collection(idOrName: 'tags'): RecordService<TagsCollection>;
	collection(idOrName: 'threadSolves'): RecordService<ThreadSolvesCollection>;
	collection(idOrName: 'leaderboard'): RecordService<LeaderboardView>;
	collection(idOrName: 'analytics'): RecordService<AnalyticsCollection>;
}
