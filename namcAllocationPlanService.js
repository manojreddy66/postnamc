const { BaseService } = require("./BaseService");
const {Prisma}=require()
class namcAllocationPlanData extends BaseService {
  constructor(db) {
    super(db);
  }

  /**
   * @description Function to get monthly NAMC allocation plan by scenarioId
   * @param {String} scenarioId - scenario id
   * @returns {Array} monthly NAMC allocation plan rows
   */
  async getMonthlyNamcAllocationPlanByScenarioId(scenarioId) {
    try {
      return await this.prisma.$queryRaw`
        select
          production_month as "monthYear",
          sub_series_description as "name",
          monthly_volume as "monthlyVolume",
          editable as "editable"
        from supply_planning.namc_allocation_plan
        where scenario_id = ${scenarioId}::uuid
        order by production_month, sub_series_description;
      `;
    } catch (err) {
      console.log("Error in getMonthlyNamcAllocationPlanByScenarioId:", err);
      throw err;
    }
  }

  /**
   * @description Function to fetch daily NAMC allocation plan by scenarioId, productionMonth and subSeries
   * @param {String} scenarioId - scenario id
   * @param {String} productionMonth - production month in YYYY-MM format
   * @param {String} subSeries - sub series description
   * @returns {Array} daily NAMC allocation plan data
   */
  async getDailyNamcAllocationByScenarioId(
    scenarioId,
    productionMonth,
    subSeries,
  ) {
    try {
      return await this.prisma.$queryRaw`
        SELECT
          production_date AS "productionDate",
          daily_volume AS "dailyVolume"
        FROM supply_planning.namc_allocation_plan
        WHERE scenario_id = ${scenarioId}::uuid
          AND production_month = ${productionMonth}
          AND sub_series_description = ${subSeries}
        ORDER BY production_date;
      `;
    } catch (err) {
      console.log("Error in getDailyNamcAllocationByScenarioId:", err);
      throw err;
    }
  }

  /**
   * @description Function to update monthly NAMC allocation plan
   */
  async updateMonthlyNamcAllocation(scenarioId, userEmail, data) {
    try {

      return await this.prisma.$queryRaw`
                    update supply_planning.namc_allocation_plan n
                    set
                    monthly_volume = v.monthly_volume,
                    last_updated_timestamp = now(),
                    updated_by = ${userEmail}
                    from (
                    values
                    ${Prisma.join(
                      data.map(
                        (item) => Prisma.sql`(
                    ${item.monthYear}::varchar,
                    ${item.subSeries}::text,
                    ${item.monthlyVolume}::int
                    )`,
                      ),
                    )}
                    ) as v(production_month, sub_series_description, monthly_volume)
                    where
                    n.scenario_id = ${scenarioId}::uuid
                    and n.production_month = v.production_month
                    and n.sub_series_description = v.sub_series_description
                    returning n.namc_allocation_id::uuid;
                    `;
    } catch (err) {
      console.log("Error in updateMonthlyNamcAllocation:", err);
      throw err;
    }
  }

  /**
   * @description Function to update daily NAMC allocation plan
   */
  async updateDailyNamcAllocation(scenarioId, userEmail, data) {
    try {

      return await this.prisma.$queryRaw`
                  update supply_planning.namc_allocation_plan n
                  set
                  daily_volume = v.daily_volume,
                  last_updated_timestamp = now(),
                  updated_by = ${userEmail}
                  from (
                  values
                  ${Prisma.join(
                    data.map(
                      (item) => Prisma.sql`(
                  ${item.prodDate}::date,
                  ${item.monthYear}::text,
                  ${item.subSeries}::text,
                  ${item.dailyVolume}::int
                  )`,
                    ),
                  )}
                  ) as v(
                  production_date,
                  production_month,
                  sub_series_description,
                  daily_volume
                  )
                  where
                  n.scenario_id = ${scenarioId}::uuid
                  and n.production_date = v.production_date
                  and n.production_month = v.production_month
                  and n.sub_series_description = v.sub_series_description
                  returning n.namc_allocation_id::uuid;
                  `;
    } catch (err) {
      console.log("Error in updateDailyNamcAllocation:", err);
      throw err;
    }
  }
}

module.exports.namcAllocationPlanData = namcAllocationPlanData;
