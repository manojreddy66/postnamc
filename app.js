/**
 * @name monthly-namc-allocation-plan
 * @description Updates scenario monthly NAMC allocation plan by scenarioId
 * @createdOn Mar 27th, 2026
 * @author Priyadarshini Gangone
 * @modifiedBy
 * @modifiedOn
 * @modificationSummary
 */

const {
  sendResponse,
  BadRequest,
  HTTP_RESPONSE_CODES,
} = require("utils/api_response_utils");
const {
  updateMonthlyNamcAllocationPlan,
} = require("./postMonthlyNamcAllocationPlanService");
const { API_ERROR_MESSAGE } = require("constants/customConstants");

/**
 * @description Lambda handler for monthly NAMC allocation plan POST API.
 * @param {Object} event: API event with body:
   {
     "scenarioId": "uniqueScenarioId",
     "userEmail": "userEmail",
     "data": [
       {
         "monthYear": "May-27",
         "subSeries": "RAV4 Gas",
         "monthlyVolume": 500
       }
     ]
   }
 * @returns {Object}: response sample is detailed below.
 * Success response with status code 200:
   {
     "message": "Successfully updated data."
   }
 * In-valid input error with status 400:
  {
    "errorMessage": [<"ValidationError: validation error message">]
  }
 * Internal server error with status code 500:
  {
    "errorMessage": "Internal Server Error"
  }
 */
exports.handler = async (event) => {
  try {
    /**
     * @description Function to validate input and update monthly NAMC allocation plan.
     * @param {Object} event: Input parameters
     * @returns {Object} response - success response object
     */
    const response = await updateMonthlyNamcAllocationPlan(event);
    console.log("response:", response);
    return sendResponse(HTTP_RESPONSE_CODES.SUCCESS, response);
  } catch (err) {
    console.log("Handler Error:", err);
    let errorMessage = API_ERROR_MESSAGE.INTERNAL_SERVER_ERROR;
    let statusCode = HTTP_RESPONSE_CODES.INTERNAL_SERVER_ERROR;
    /**
     * @description If error is BadRequest, return 400 with validation messages
     */
    if (err instanceof BadRequest) {
      statusCode = HTTP_RESPONSE_CODES.BAD_REQUEST;
      errorMessage = err.message
        .split(/,(?=ValidationError:)/)
        .map((e) => e.trim());
      console.log("Validation error messages: ", errorMessage);
    }
    return sendResponse(statusCode, { errorMessage: errorMessage });
  }
};