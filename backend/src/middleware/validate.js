import { error } from '../utils/response.js';

/**
 * Zod request body validator middleware factory.
 * Usage: router.post('/route', validate(myZodSchema), controller)
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
    return error(res, 'Invalid request body', 400, 'VALIDATION_ERROR', details);
  }
  req.body = result.data; // replace with parsed/coerced data
  next();
};

export default validate;
