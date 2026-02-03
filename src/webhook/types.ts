import * as v from 'valibot';

const job_types = ['full-time', 'part-time', 'contract', 'freelance'] as const;

export const job_post_schema = v.object({
	title: v.pipe(
		v.string('title must be a string'),
		v.trim(),
		v.nonEmpty('title is required'),
	),
	company: v.pipe(
		v.string('company must be a string'),
		v.trim(),
		v.nonEmpty('company is required'),
	),
	description: v.pipe(
		v.string('description must be a string'),
		v.trim(),
		v.nonEmpty('description is required'),
	),
	url: v.pipe(
		v.string('url must be a string'),
		v.url('url must be a valid URL'),
	),
	location: v.optional(v.string()),
	type: v.optional(
		v.picklist(
			job_types,
			'type must be one of: full-time, part-time, contract, freelance',
		),
	),
	salary: v.optional(v.string()),
});

export type JobPostPayload = v.InferOutput<typeof job_post_schema>;

export interface WebhookResponse {
	success: boolean;
	message: string;
	messageId?: string;
}

export interface WebhookErrorResponse {
	success: false;
	error: string;
	details?: string[];
}
