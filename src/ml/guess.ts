import use from '@tensorflow-models/universal-sentence-encoder';
import tf from '@tensorflow/tfjs-node';
import { join } from 'desm';

console.log('Loading USE Encoder...');
const encoder = await use.load();

console.log('Loading model...');
const model = await tf.loadLayersModel(
	tf.io.fileSystem(join(import.meta.url, './model/model.json')),
);

console.log('TF Ready');

export async function guess(content: string) {
	const tensor = await encoder.embed([content]);

	const predicted = model.predict(tensor);
	const result = Array.isArray(predicted) ? predicted[0] : predicted; // ts thinks it's an array so lets pander

	const chance = result.dataSync()[0];

	return {
		question: chance > 0.85,
		message: chance <= 0.85,
		chance,
	};
}
