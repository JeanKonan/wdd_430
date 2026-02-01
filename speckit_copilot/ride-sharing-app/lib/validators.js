import Joi from 'joi';

/**
 * Validation schema for user registration
 */
export const registerSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .min(8)
    .max(100)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .required()
    .messages({
      'string.min': 'Password must be at least 8 characters long',
      'string.max': 'Password must not exceed 100 characters',
      'string.pattern.base':
        'Password must contain at least one uppercase letter, one lowercase letter, and one number',
      'any.required': 'Password is required',
    }),

  fullName: Joi.string()
    .min(2)
    .max(100)
    .trim()
    .required()
    .messages({
      'string.min': 'Full name must be at least 2 characters long',
      'string.max': 'Full name must not exceed 100 characters',
      'any.required': 'Full name is required',
    }),

  phone: Joi.string()
    .pattern(/^[\d\s\-\+\(\)]+$/)
    .allow('', null)
    .messages({
      'string.pattern.base': 'Please provide a valid phone number',
    }),

  bio: Joi.string()
    .max(500)
    .allow('', null)
    .messages({
      'string.max': 'Bio must not exceed 500 characters',
    }),
});

/**
 * Validation schema for user login
 */
export const loginSchema = Joi.object({
  email: Joi.string()
    .email({ tlds: { allow: false } })
    .required()
    .messages({
      'string.email': 'Please provide a valid email address',
      'any.required': 'Email is required',
    }),

  password: Joi.string()
    .required()
    .messages({
      'any.required': 'Password is required',
    }),
});

/**
 * Validation schema for ride creation/update
 */
export const rideSchema = Joi.object({
  location: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Departure location must be at least 2 characters',
      'string.max': 'Departure location must not exceed 200 characters',
      'any.required': 'Departure location is required',
    }),

  destination: Joi.string()
    .min(2)
    .max(200)
    .required()
    .messages({
      'string.min': 'Destination must be at least 2 characters',
      'string.max': 'Destination must not exceed 200 characters',
      'any.required': 'Destination is required',
    }),

  departureTime: Joi.date()
    .greater('now')
    .required()
    .messages({
      'date.greater': 'Departure time must be in the future',
      'any.required': 'Departure time is required',
    }),

  totalSeats: Joi.number()
    .integer()
    .min(1)
    .max(8)
    .required()
    .messages({
      'number.min': 'Must have at least 1 total seat',
      'number.max': 'Cannot exceed 8 total seats',
      'any.required': 'Total number of seats is required',
    }),

  availableSeats: Joi.number()
    .integer()
    .min(0)
    .max(Joi.ref('totalSeats'))
    .required()
    .messages({
      'number.min': 'Must have at least 0 available seats',
      'number.max': 'Available seats cannot exceed total seats',
      'any.required': 'Number of available seats is required',
    }),

  itinerary: Joi.string()
    .max(1000)
    .allow('', null)
    .messages({
      'string.max': 'Itinerary must not exceed 1000 characters',
    }),
});

/**
 * Helper function to validate data against a schema
 * @param {Object} schema - Joi schema to validate against
 * @param {Object} data - Data to validate
 * @returns {Object} { error, value }
 */
export function validate(schema, data) {
  return schema.validate(data, { abortEarly: false, stripUnknown: true, convert: true });
}
