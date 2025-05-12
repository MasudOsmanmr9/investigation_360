// export const errorHandeler = (err, req, res, next) => {
//     console.error(err);
//     if (err.name === 'UnauthorizedError') {
//         res.status(401).json({ message: 'Unauthorized' });
//     } else {
//         res.status(500).json({ message: 'Internal server error' });
//     }
// };

import { CustomError } from '../errors/customError.js';

export const errorHandler = (err, req, res, next) => {
    console.log('Error handler middleware:', err);
  if (err instanceof CustomError) {
    console.log('CustomError', err);
    return res.status(err.statusCode).send({ errors: err.serializeErrors() });
  }

  console.error(err);

  return res.status(400).send({
    errors: [{ message: 'Something went wrong' }],
  });
};