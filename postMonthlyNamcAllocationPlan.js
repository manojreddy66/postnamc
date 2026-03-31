/**
 * @description DB operations to update monthly NAMC allocation plan and scenario step status
 */

const { dbConnect } = require("prismaORM/index");
const {
  namcAllocationPlanData,
} = require("prismaORM/services/namcAllocationPlanService");
const {
  namcProductionCalendarData,
} = require("prismaORM/services/namcProductionCalendarService");
const {
  scenarioStepStatusData,
} = require("prismaORM/services/scenarioStepStatusService");
const { scenariosData } = require("prismaORM/services/scenariosService");
const {
  buildRedistributedAllocationData,
  getUniqueMonthYears,
} = require("./utils");
const {
  SCENARIO_STATUSES,
  SCENARIO_STEP_STATUSES,
  VALID_STEP_NAMES,
} = require("constants/customConstants");
const { getStepNameFromSubstep } = require("utils/common_utils");

/**
 * @description Function to update monthly NAMC allocation plan and scenario steps status details
 * @param {Object} scenarioData - scenarioData by scenarioId
 * @param {*} userEmail - userEmail from input
 * @param {*} data - edited monthly NAMC allocation plan data
 */
async function updateMonthlyNamcAllocNScenarioStepData(
  scenarioData,
  userEmail,
  data,
) {
  const rdb = await dbConnect();
  const namcAllocationPlanDataService = new namcAllocationPlanData(rdb);
  const namcProductionCalendarDataService = new namcProductionCalendarData(rdb);
  const scenarioStepStatusDataService = new scenarioStepStatusData(rdb);
  const scenariosDataService = new scenariosData(rdb);
  try {
    const scenarioId = scenarioData.scenario_id;
    console.log("scenarioData:", scenarioData);
    /**
     * @description Convert input monthYear values to DB required month format and make it unique months
     */
    const monthYears = getUniqueMonthYears(data);
    console.log("monthYears:", monthYears);
    /**
     * @description Fetch NAMC production calendar data for edited months
     */
    const productionCalendarData =
      await namcProductionCalendarDataService.getNamcProductionCalendarDataByMonthYears(
        scenarioId,
        monthYears,
      );
console.log("productionCalendarData:", productionCalendarData);
    /**
     * @description Build monthly and daily redistributed update data
     */
    const { monthlyData, redistributedDailyData } =
      buildRedistributedAllocationData(data, productionCalendarData);
    console.log("monthlyData:", monthlyData);
    console.log("redistributedDailyData:", redistributedDailyData);
    await rdb.prisma.$transaction(async (tx) => {
      /**
       * @description Update only monthly volume for edited months
       */
        await namcAllocationPlanDataService.updateMonthlyNamcAllocation(
          scenarioId,
          userEmail,
          monthlyData,
          tx,
        );
      /**
       * @description Update daily volume when production calendar data exists
       * for edited months and redistribution is required
       */
      if (redistributedDailyData.length > 0) {
        await namcAllocationPlanDataService.updateDailyNamcAllocation(
          scenarioId,
          userEmail,
          redistributedDailyData,
          tx,
        );
      }
      /**
       * @description Upsert scenario step status for NAMC Allocation Plan to In Progress
       */
      await scenarioStepStatusDataService.upsertScenarioStepStatus(
        scenarioId,
        userEmail,
        VALID_STEP_NAMES[2],
        getStepNameFromSubstep(VALID_STEP_NAMES[2]),
        SCENARIO_STEP_STATUSES.IN_PROGRESS,
        tx,
      );
      /**
       * @description Update main scenario status to In Progress
       * only if current scenario status is not already In Progress
       */
      if (
        scenarioData &&
        scenarioData.scenario_status !== SCENARIO_STATUSES.IN_PROGRESS
      ) {
        await scenariosDataService.updateScenarioStatus(
          scenarioId,
          userEmail,
          SCENARIO_STATUSES.IN_PROGRESS,
          tx,
        );
      }
    });
  } catch (err) {
    console.log("Error in updateMonthlyNamcAllocNScenarioStepData:", err);
    throw err;
  }
}

module.exports = {
  updateMonthlyNamcAllocNScenarioStepData,
};
