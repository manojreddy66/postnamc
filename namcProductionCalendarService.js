const { BaseService } = require("./BaseService");

class namcProductionCalendarData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Function to get NAMC production calendar data by scenarioId and monthNumber 
   * @param {String} scenarioId - scenario UUID
   * @param {String} monthYear - formatted month and year (YYYYMM)
   * @returns {Array} NAMC production calendar records
   */
  async getNamcProductionCalendarData(scenarioId, monthYear) {
    try {
      return await this.prisma.$queryRaw`
        select
          prod_date as "prodDate",
          day_of_week as "dayOfWeek",
          is_working_day as "isWorkingDay",
          work_day_percentage as "workDayPercentage",
          week_number as "week",
          editable as "isEditable"
        from supply_planning.namc_production_calendar
        where scenario_id = ${scenarioId}::uuid
          and month_number = ${Number(monthYear)}::integer
        order by prod_date;`;
    } catch (err) {
      console.log("Error in getNamcProductionCalendarData:", err);
      throw err;
    }
  }
}

module.exports.namcProductionCalendarData = namcProductionCalendarData;
