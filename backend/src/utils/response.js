/**
 * Standard API response helpers.
 * Always use these — never raw res.json() in controllers.
 */

export const success = (res, data = {}, message = 'Success', statusCode = 200, pagination = null) => {
  const payload = { success: true, message, data };
  if (pagination) payload.pagination = pagination;
  return res.status(statusCode).json(payload);
};

export const error = (res, message = 'Something went wrong', statusCode = 500, errorCode = 'SERVER_ERROR', details = null) => {
  const payload = { success: false, error: errorCode, message };
  if (details) payload.details = details;
  return res.status(statusCode).json(payload);
};
