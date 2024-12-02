import handlers from '../server/handler.js';

const routes = [
  {
    path: '/predict',
    method: 'POST',
    handler: handlers.postPredict,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        maxBytes: 5000000,
      },
      validate: {
        payload: {
          image: Joi.binary().required().description('Image to be predicted'), // Validate image is provided
        }
      }
    },
  },
  {
    path: '/predict/histories',
    method: 'GET',
    handler: handlers.getPredictHistories,
  },
];

export default routes;