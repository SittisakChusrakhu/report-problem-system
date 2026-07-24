// middleware/validate.middleware.js
// Reusable middleware factory: validates req.body (or req.query) against a
// Zod schema before the request reaches the controller. On failure, responds
// 400 with a Thai-friendly message list instead of letting bad data reach
// the service/repository layer.

const validate = (schema, source = "body") => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);

    if (!result.success) {
      const messages = result.error.issues.map((issue) => issue.message);
      return res.status(400).json({
        message: messages[0], // first error, ready to show in a toast
        errors: messages,     // full list, in case the frontend wants all of them
      });
    }

    // Replace with the parsed/transformed data (e.g. stu_grade coerced to number)
    req[source] = result.data;
    next();
  };
};

module.exports = { validate };