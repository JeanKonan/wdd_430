const Joi = require('joi');

const rideSchema = Joi.object({
  location: Joi.string().min(2).max(200).required(),
  destination: Joi.string().min(2).max(200).required(),
  departureTime: Joi.date().iso().greater('now').required(),
  totalSeats: Joi.number().integer().min(1).max(8).required(),
  availableSeats: Joi.number().integer().min(0).max(Joi.ref('totalSeats')).required(),
  itinerary: Joi.string().max(1000).allow('', null),
});

const futureDate = new Date();
futureDate.setHours(futureDate.getHours() + 4);

const testData = {
  location: 'San Jose',
  destination: 'San Diego',
  departureTime: futureDate.toISOString(),
  totalSeats: 5,
  availableSeats: 5,
  itinerary: 'Updated route',
};

const result = rideSchema.validate(testData, { abortEarly: false, stripUnknown: true, convert: true });
console.log('Validation result:', JSON.stringify(result, null, 2));
