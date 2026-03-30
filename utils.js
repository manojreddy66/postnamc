/**
 * @description this file contains monthly NAMC allocation plan common utils
 */
const { MONTH_MAP } = require("constants/customConstants");

/**
 * @description Function to prepare monthly NAMC allocation plan response
 * @returns {Object} response - Formatted response
 */
function prepareResponse() {
  return {
    message: "Successfully updated data.",
  };
}

/**
 * @description Function to convert UI monthYear to DB monthYear format
 * @param {String} monthYear - input monthYear in MMM-YY format
 * @returns {String} formatted monthYear in YYYY-MM format
 */
function formatInputMonthYearToDbMonthYear(monthYear) {
  const [month, year] = monthYear.split("-");
  return `20${year}-${MONTH_MAP[month]}`;
}

/**
 * @description Function to get unique DB monthYear values from request data
 * @param {Array} data - edited monthly NAMC allocation plan data
 * @returns {Array} unique DB monthYear values
 */
function getUniqueMonthYears(data) {
  return [
    ...new Set(
      data.map((item) => formatInputMonthYearToDbMonthYear(item.monthYear)),
    ),
  ];
}

/**
 * @description Function to redistribute month value to day level values using day percentages as weights
 * @param {Object} params - redistribution params
 * @param {number} params.monthlyVolume - monthly volume
 * @param {Array} params.calendarRows - production calendar rows
 * @returns {Array} redistributed day level rows
 */
function redistributeMonthlyInteger({ monthlyVolume, calendarRows }) {
  const rows = getCalendarRowsWithWeights(calendarRows);

  const totalWeight = rows.reduce((sum, row) => sum + row.weight, 0);

  if (totalWeight <= 0 || Number(monthlyVolume) === 0) {
    return rows.map(({ prodDate }) => ({
      prodDate,
      dailyVolume: 0,
      monthlyVolume: Number(monthlyVolume || 0),
    }));
  }

  let allocated = 0;

  rows.forEach((row) => {
    if (row.weight <= 0) return;
    const rawShare = (Number(monthlyVolume) * row.weight) / totalWeight;
    row.dailyVolume = Math.floor(rawShare);
    row.remainder = rawShare - row.dailyVolume;
    allocated += row.dailyVolume;
  });

  let leftover = Number(monthlyVolume) - allocated;

  if (leftover > 0) {
    const candidates = getWorkingDayCandidates(rows);

    for (let i = 0; i < leftover; i++) {
      candidates[i % candidates.length].dailyVolume += 1;
    }
  }

  return rows.map(({ prodDate, dailyVolume }) => ({
    prodDate,
    dailyVolume
  }));
}

function getCalendarRowsWithWeights(calendarRows) {
  return calendarRows.map((row, idx) => {
    const percentage = Number(row.percentage || 0);
    const isWorking = Boolean(row.isWorking);

    return {
      idx,
      prodDate: row.prodDate,
      isWorking,
      percentage,
      weight: isWorking ? Math.max(0, percentage) : 0,
      dailyVolume: 0,
      remainder: 0,
    };
  });
}

function getWorkingDayCandidates(rows) {
  return rows
    .filter((row) => row.weight > 0)
    .sort((a, b) => {
      if (b.remainder !== a.remainder) return b.remainder - a.remainder;
      if (b.weight !== a.weight) return b.weight - a.weight;
      return a.idx - b.idx;
    });
}

/**
 * @description Function to group production calendar data by month
 * @param {Array} productionCalendarData - production calendar rows
 * @returns {Object} grouped production calendar data
 */
function groupProductionCalendarByMonth(productionCalendarData) {
  const groupedData = {};

  productionCalendarData.forEach((item) => {
    const monthYearKey = item.productionMonth;
    if (!groupedData[monthYearKey]) {
      groupedData[monthYearKey] = [];
    }

    groupedData[monthYearKey].push({
      prodDate: item.prodDate,
      isWorking: item.isWorking,
      percentage: item.percentage,
    });
  });

  return groupedData;
}

/**
 * @description Function to build monthly only update data and redistributed daily update data
 * @param {Array} data - edited monthly NAMC allocation plan data
 * @param {Array} productionCalendarData - production calendar rows
 * @returns {Object} formatted update payloads
 */
function buildRedistributedAllocationData(data, productionCalendarData) {
  const groupedCalendarData = groupProductionCalendarByMonth(
    productionCalendarData,
  );
  const monthlyData = [];
  const redistributedDailyData = [];

  data.forEach((item) => {
    const dbMonthYear = formatInputMonthYearToDbMonthYear(item.monthYear);
    const monthCalendarRows = groupedCalendarData[dbMonthYear] || [];

    if (!monthCalendarRows.length) {
      monthlyData.push({
        monthYear: dbMonthYear,
        subSeries: item.subSeries,
        monthlyVolume: Number(item.monthlyVolume || 0),
      });
      return;
    }

    const redistributedRows = redistributeMonthlyInteger({
      monthlyVolume: Number(item.monthlyVolume || 0),
      calendarRows: monthCalendarRows,
    });

    redistributedRows.forEach((row) => {
      redistributedDailyData.push({
        prodDate: row.prodDate,
        monthYear: dbMonthYear,
        subSeries: item.subSeries,
        dailyVolume: row.dailyVolume
      });
    });
  });

  return {
    monthlyData,
    redistributedDailyData,
  };
}

module.exports = {
  prepareResponse,
  formatInputMonthYearToDbMonthYear,
  getUniqueMonthYears,
  redistributeMonthlyInteger,
  buildRedistributedAllocationData,
};
