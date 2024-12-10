const { body, validationResult } = require('express-validator');

// Validator for user authentication (for example, login)
const validateAuthInput = [
  body('email').isEmail().withMessage('Invalid email format'),
  body('password').isLength({ min: 6 }).withMessage('Password should be at least 6 characters'),
];

// Validator for news creation
const validateNewsInput = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('image').notEmpty().withMessage('Image URL is required'),
];

const validateContactusData = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('message').notEmpty().withMessage('Message is required'),
];

// Middleware to handle validation errors
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = {
  validateNewsInput,
  validateAuthInput,
  validateRequest,
  validateContactusData,
};