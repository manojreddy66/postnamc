const Joi = require("joi");

/**
 * @description Returns schema to validate monthly NAMC allocation plan request
 * @returns {Object} Joi schema
 */
function getValidationSchema() {
  return Joi.object({
    scenarioId: Joi.string()
      .trim()
      .guid({ version: "uuidv4" })
      .required()
      .messages({
        "any.required":
          "ValidationError: scenarioId is required and must be a uuid.",
        "string.base":
          "ValidationError: scenarioId is required and must be a uuid.",
        "string.empty":
          "ValidationError: scenarioId is required and must be a uuid.",
        "string.guid":
          "ValidationError: scenarioId is required and must be a uuid.",
      }),
    userEmail: Joi.string()
      .trim()
      .required()
      .email({ tlds: { allow: ["com"] } })
      .messages({
        "any.required":
          "ValidationError: userEmail is required and must be a string.",
        "string.base":
          "ValidationError: userEmail is required and must be a string.",
        "string.email.tlds": "ValidationError: Invalid userEmail.",
        "any.only":
          "ValidationError: userEmail is required and must be a string.",
        "string.empty":
          "ValidationError: userEmail is required and must be a string.",
        "string.email": "ValidationError: Invalid userEmail.",
      }),
    data: Joi.array()
      .items(
        Joi.object({
          monthYear: Joi.string()
            .trim()
            .pattern(
              /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)-\d{2}$/
            )
            .required()
            .messages({
              "any.required":
                "ValidationError: monthYear is required and must be a string in the format MMM-YY.",
              "string.base":
                "ValidationError: monthYear is required and must be a string in the format MMM-YY.",
              "string.empty":
                "ValidationError: monthYear is required and must be a string in the format MMM-YY.",
              "string.pattern.base":
                "ValidationError: monthYear is required and must be a string in the format MMM-YY.",
            }),
          subSeries: Joi.string().trim().required().messages({
            "any.required":
              "ValidationError: subSeries is required and must be a string.",
            "string.base":
              "ValidationError: subSeries is required and must be a string.",
            "string.empty":
              "ValidationError: subSeries is required and must be a string.",
          }),
          monthlyVolume: Joi.number()
            .integer()
            .min(0)
            .max(99999)
            .required()
            .messages({
              "any.required":
                "ValidationError: monthlyVolume is required and must be a non-negative number not more than 99,999.",
              "number.base":
                "ValidationError: monthlyVolume is required and must be a non-negative number not more than 99,999.",
              "number.integer":
                "ValidationError: monthlyVolume is required and must be a non-negative number not more than 99,999.",
              "number.min":
                "ValidationError: monthlyVolume is required and must be a non-negative number not more than 99,999.",
              "number.max":
                "ValidationError: monthlyVolume is required and must be a non-negative number not more than 99,999.",
            }),
        })
      )
      .min(1)
      .required()
      .messages({
        "any.required":
          "ValidationError: data is required and must be an array with atleast 1 item.",
        "array.base":
          "ValidationError: data is required and must be an array with atleast 1 item.",
        "array.min":
          "ValidationError: data is required and must be an array with atleast 1 item.",
      }),
  });
}

module.exports = {
  getValidationSchema,
};
