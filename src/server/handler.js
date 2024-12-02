import predictClassification from '../services/inferenceService.js';
import crypto from 'crypto';
import { storeData, predictionsCollection } from '../services/dataService.js';
import { InputError } from '../exceptions/InputError.js';

async function postPredict(request, h) {
  const { image } = request.payload;
  const { model } = request.server.app;

  // Check if model is loaded
  if (!model) {
    throw new InputError('Model is not loaded properly', 500);
  }

  const { resultScore, result, description } = await predictClassification(
    model,
    image
  );
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();

  const data = {
    id,
    result,
    description,
    createdAt,
  };

  // Store prediction data (with error handling)
  try {
    await storeData(id, data);
  } catch (error) {
    throw new InputError('Failed to store prediction data', 500);
  }
  
  return h
    .response({
      status: 'success',
      message:'Model is predicted successfully',
      data,
    })
    .code(201);
}

async function getPredictHistories(request, h) {
  try {
    // Fetch prediction histories from the database
    const histories = (await predictionsCollection.get()).docs.map((doc) => doc.data());

    // Map data into a structured format
    const data = histories.map((item) => ({
      id: item.id,
      history: item,
    }));

    return h.response({
      status: 'success',
      data,
    }).code(200);
  } catch (error) {
    // Handle potential errors from Firestore
    return h.response({
      status: 'fail',
      message: error.message || 'Failed to fetch prediction histories',
    }).code(error.statusCode || 500);
  }
}

export default { postPredict, getPredictHistories };
