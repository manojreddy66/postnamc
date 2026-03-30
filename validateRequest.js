/**
 * @description this file contains request validation methods
 */

const { dbConnect } = require("prismaORM/index");
const { scenariosData } = require("prismaORM/services/scenariosService");
const {
  getValidationSchema,
} = require("schemaValidator/supplyPlanning/namcAllocationPlan/postMonthlyNamcAllocationPlanSchema");
const { emptyInputCheck } = require("utils/common_utils");

/**
 * @description Function to validate input request body
 * @param {Object} requestBody: API input request body
 * @returns {Array} errorMessages - Validation errors if any
 */
async function validateInput(requestBody) {
  const errMessages = [];
  /**
    * @description Check if request body is empty
    */
   emptyInputCheck(requestBody);
  /**
   * @description Validate request body using Joi schema
   * @param {Object} requestBody - request body
   * @param {Array} errMessages - array of validation errors
   */
  await validateParams(requestBody, errMessages);
    let scenarioData = null;
    /**
    * @description If Joi validation passed, perform DB validations
    */
    if (errorMessages.length === 0) {
        /**
        * @description Validate scenario exists (DB validation)
        */
        scenarioData = await checkForInvalidScenario(requestBody, errMessages);
    }
  return { errorMessages, scenarioData };
}

/**
 * @description Function to validate request params using Joi schema
 * @param {Object} requestBody - request body
 * @param {Array} errMessages - array to collect validation errors
 */
async function validateParams(requestBody, errMessages) {
  // Validation options to collect all error messages
  const options = { abortEarly: false };
  const schema = await getValidationSchema();
  const { error } = await schema.validate(requestBody, options);
  if (error) {
    error.details.forEach((detail) => {
      errMessages.push(detail.message);
    });
  }
}

/**
 * @description Function to check if a scenario exists
 * @param {Object} requestBody: Input request payload
 * @param {Array} errMessages - array to collect validation errors
 */
async function checkForInvalidScenario(requestBody, errMessages) {
  /* Connecting to DB instance */
  const rdb = await dbConnect();
  const scenariosDataService = new scenariosData(rdb);
  try {
    /**
     * @description Get scenario data by scenarioId
     */
    const scenarioData = await scenariosDataService.getScenarioDataById(
      requestBody.scenarioId
    );
    /**
     * @description If provided scenarioId doesn't exist, add validation error and return null
     */
    if (!scenarioData || scenarioData.length === 0) {
      errMessages.push("ValidationError: Scenario doesn't exist.");
      return null;
    }
    return scenarioData[0];
  } catch (err) {
    console.log("Error in checkForInvalidScenario:", err);
    throw err;
  }
}

module.exports = {
  validateInput,
};