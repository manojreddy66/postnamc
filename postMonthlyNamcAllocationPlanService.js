/**
 * @description Service file for POST monthly NAMC allocation plan API
 */

const { BadRequest } = require("utils/api_response_utils");
const { validateInput } = require("./validateRequest");
const {
  updateMonthlyNamcAllocPlanNScenarioStepData,
} = require("./monthlyNamcAllocationPlan");
const { prepareResponse } = require("./utils");

/**
 * @description Function to validate input and update monthly NAMC allocation plan response
 * @param {Object} event - lambda event
 * @returns {Object} formatted response
 */
async function updateMonthlyNamcAllocationPlan(event) {
  try {
    const requestBody = event?.body ? JSON.parse(event.body) : {};
    console.log("requestBody:", requestBody);

    /**
     * @description Validate input body
     * @param {Object} requestBody - request body
     * @return {Object} errorMessages & scenarioData
     */
    const {errorMessages, scenarioData} = await validateInput(requestBody);
    /* If validation errors exist, throw BadRequest error */
    if (errorMessages.length > 0) {
      throw new BadRequest(errorMessages);
    }
    const { scenarioId, userEmail, data } = requestBody;
    /**
     * @description Update monthly NAMC allocation plan data and scenario step status data
     * @param {Object} scenarioData - scenario data by id
     * @param {String} userEmail - user email
     * @param {Array} data - edited monthly NAMC allocation plan data
     */
    await updateMonthlyNamcAllocNScenarioStepData(
      scenarioData,
      userEmail,
      data
    );
    /**
     * @description Prepare final response
     */
    return prepareResponse();
  } catch (err) {
    console.log("Error in updateMonthlyNamcAllocationPlan:", err);
    throw err;
  }
}

module.exports = {
  updateMonthlyNamcAllocationPlan,
};