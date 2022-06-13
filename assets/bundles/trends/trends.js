//
// TODO
// * careful with the dates!!!! (locale)
// * try TypeScript
// * [a...b) date intervals!
// * selection to analyze growth
// * adding and removing points
// * importing database from elsewhere?
//

const DAYS_PER_YEAR = 365;
const DAYS_PER_MONTH = 30;

let regression = methods;

let params = {
  startDate: parseDate('01/01/1950'),
  endDate: parseDate('01/01/2023'),
  xAxis: "Publication date",
  yAxis: "Parameters",
  separateCategories: false,
  citationThreshold: 0,
  otherDomainThreshold: 10,

  startDlEra: parseDate('01/01/2009'),
  startLargeScaleEra: parseDate('01/01/2018'),

  largeScaleAction: "ignore",
  outliersAction: "label",
  recordSettersAction: "label",
  bigAlphagoAction: "label",
  alphagozeroAction: "ignore",

  lowOutliersZValueThreshold: -2,
  highOutliersZValueThreshold: 0.82,
  outlierWindowSize: 2,

  filterText: "",

  splitDomains: [,], // ['Language', 'Vision', 'Games', 'Other', 'All']

  domainsToNotSplit: ['Vision'],

  ranges: {
    'Parameters':                              [-Infinity, +Infinity],
    'Training compute (FLOPs)':                [-Infinity, +Infinity],
    'Inference compute (FLOPs)':               [-Infinity, +Infinity],
    'Training dataset size (datapoints)':      [-Infinity, +Infinity],
    'Inference compute per parameter (FLOPs)': [-Infinity, +Infinity],
    'Inference compute times parameters':      [-Infinity, +Infinity],
  },

  splitDlEra: true,
  splitLargeScaleEra: true,

  plotRegressions: false,

  bootstrapSampleSize: 1000,
  adjustForEstimateUncertainty: true,
};

function init(database) {
  function parseDate(str) {
    let fields = str.split("/");

    let day = 1;
    let month = 1;
    let year;

    if (fields.length == 1) {
      year = fields[0];
    } else {
      day   = fields[0];
      month = fields[1];
      year  = fields[2];
    }

    return new Date(year, month - 1, day, 1, 0, 0, 0);
  }

  function dateToJulianDate(date) {
    var x = Math.floor((14 - date.getMonth())/12);
    var y = date.getFullYear() + 4800 - x;
    var z = date.getMonth() - 3 + 12 * x;

    var n = date.getDate() + Math.floor(((153 * z) + 2)/5) + (365 * y) + Math.floor(y/4) + Math.floor(y/400) - Math.floor(y/100) - 32045;

    return n;
  }   

  for (let rowIndex = 0; rowIndex < database.rows.length; rowIndex++) {
    let row = database.rows[rowIndex];

    // Parsing
    row["Publication date"] = parseDate(row["Publication date"]);
    row["Publication date (julian date)"] = dateToJulianDate(row["Publication date"]);
    row["Training compute (FLOPs)"] = parseFloat(row["Training compute (FLOPs)"]);
    row["Inference compute (FLOPs)"] = parseFloat(row["Inference compute (FLOPs)"]);
    row["Training dataset size (datapoints)"] = parseFloat(row["Training dataset size (datapoints)"]);
    row["Parameters"] = parseFloat(row["Parameters"]);
    row["Citations"] = parseFloat(row["Citations"]);
    if (isNaN(row["Citations"])) row["Citations"] = 0;

    // Row augmentation
    row["Training compute per parameter (FLOPs)"] = row["Training compute (FLOPs)"] / row["Parameters"];
    row["Training compute times parameters"] = row["Training compute (FLOPs)"] * row["Parameters"];

    row["visible"] = true;
  }

  return database;
}

function generateGraph(database, params) {
  // TODO Check this
  let minDate = params.endDate;
  let maxDate = params.startDate;

  let rows = [];
  let domainCount = {};

  // Preprocessing
  for (let rowIndex = 0; rowIndex < database.rows.length; rowIndex++) {
    let row = database.rows[rowIndex];

    row.deleted = true;

    row["_Domain"] = row["Domain"];

    if (!params.separateCategories) {
      row["_Domain"] = "All";
    }

    if (row["System"] == "AlphaGo Zero" && params.alphagozeroAction == "label") {
      row["_Domain"] = 'AlphaGo Zero';
    }

    //
    // Filtering
    //

    // By date
    if (!(params.startDate <= row["Publication date"] && row["Publication date"] < params.endDate)) {
      continue;
    }

    // By number of citations
    if (row["Citations"] < params.citationThreshold) {
      continue;
    }

    // By zeroes/NaNs
    if (isNaN(row[params.xAxis]) || isNaN(row[params.yAxis]) || row[params.yAxis] == 0 || (params.xAxis != "Publication date" && row[params.xAxis] == 0)) {
      continue;
    }

    // By ranges
    let passesRangeFilter = true;
    for (let param in params.ranges) {
      let range = params.ranges[param];

      if (Number.isFinite(range[0]) && row[param] < range[0]) {
        passesRangeFilter = false;
        break;
      }

      if (Number.isFinite(range[1]) && row[param] >= range[1]) {
        passesRangeFilter = false;
        break;
      }
    }

    if (!passesRangeFilter) {
      continue;
    }

    if (row["System"] == "AlphaGo Zero" && params.alphagozeroAction == "remove") {
      continue;
    }

    row.deleted = false;

    //
    // Misc
    //
    if (row["Publication date"] < minDate) minDate = row["Publication date"];
    if (row["Publication date"] > maxDate) maxDate = row["Publication date"];

    let domain = row["_Domain"];
    if (!(domain in domainCount)) domainCount[domain] = 0;
    domainCount[domain]++;

    row._x = row[params.xAxis];
    row._y = row[params.yAxis];

    rows.push(row);
  }

  // Recode low count domains as "other"
  for (let row of rows) {
    if (domainCount[row["_Domain"]] < params.otherDomainThreshold) {
      row["_Domain"] = "Other";
    }
  }

  //
  // Eras
  //

  // Define eras
  eras = [
    {Era:                   'All', start: params.startDate,          stop: params.endDate},
    {Era: 'Pre Deep Learning Era', start: params.startDate,          stop: params.startDlEra},
    {Era:     'Deep Learning Era', start: params.startDlEra,         stop: params.startLargeScaleEra},
    {Era:       'Large Scale Era', start: params.startLargeScaleEra, stop: params.endDate},
  ]

  // Modify eras start-stop to fit the considered timespan and remove the ones outside of it
  for (let eraIndex = eras.length - 1; eraIndex >= 0; eraIndex--) {
    let era = eras[eraIndex];

    if (era.start >= params.endDate || era.stop <= params.startDate) {
      eras.splice(eraIndex, 1);
      continue;
    }

    // TODO Is this right when there are few systems? You might have made a mistake translating the code.
    if (era.stop > params.endDate)    era.stop = params.endDate;
    if (era.start < params.startDate) era.start = params.startDate;
  }

  rows = filterOutliers(rows, params);
  rows = filterRecords(rows, params);

  // Separate domains per era
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    let row = rows[rowIndex];

    if (!(params.splitDomains.includes(row["_Domain"]))) {
      continue;
    }

    for (let era of eras) {
      if ((era.start <= row["Publication date"]) && (row["Publication date"] <= era.stop)) {
        row["_Domain"] += " " + era.Era;
        break;
      }
    }
  }

  addEraInfo(rows, eras, params);

  let regressionResults = regressData(rows, eras, params);

  return {systems: rows, eras: eras, regressionData: regressionResults.lines, regressionInfoTable: regressionResults.infoTable};
}

// TODO Regress on each domain

function filterOutliers(rows, params) {
  rows.sort(function(a,b) {
    return a["Publication date"] - b["Publication date"];
  });

  let outlierRows = [];
  let largeScaleRows = [];

  for (let axis of [params.xAxis, params.yAxis]) {
    if (axis == 'Publication date') continue;

    let loopCount = 0;

    let startFinger = 0
    let endFinger = 0

    let rollingSum = 0
    let rollingSquareSum = 0
    let rollingCount = 0

    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      let row = rows[rowIndex];
      if (row.deleted) continue;

      // Filter entries in a 3-year window around the paper
      let windowSize = params.outlierWindowSize * 52*7*86400e3;

      let window = [
        new Date(row["Publication date"].getTime() - windowSize/2),
        new Date(row["Publication date"].getTime() + windowSize/2),
      ];

      while (startFinger < rows.length && rows[startFinger]["Publication date"] < window[0]) {
        let v = Math.log10(rows[startFinger][axis]);
        rollingSum -= v;
        rollingSquareSum -= v*v;
        rollingCount--;
        startFinger++;
      }

      while (endFinger < rows.length && rows[endFinger]["Publication date"] < window[1]) {
        let v = Math.log10(rows[endFinger][axis]);
        rollingSum += v;
        rollingSquareSum += v*v;
        rollingCount++;
        endFinger++;
      }

      if (rollingCount < 2) continue

      let v = Math.log10(row[axis]);

      let mean = rollingSum/rollingCount;
      let variance = (rollingSquareSum/rollingCount) - mean**2;
      let std = Math.sqrt(variance);

      let zScore = (v - mean)/std;

      if (zScore < params.lowOutliersZValueThreshold) {
        outlierRows.push(row);
      }

      if (zScore > params.highOutliersZValueThreshold && row['Publication date'] > params.startLargeScaleEra) {
        largeScaleRows.push(row);
      }
    }
  }

  for (let row of outlierRows) {
    if (params.outliersAction == 'remove') {
      row.deleted = true;
    } else if (params.outliersAction == 'label') {
      row._Domain = 'Outlier';
    }
  }

  if (params.largeScaleAction == 'label') {
    for (let row of largeScaleRows) {
      row["_Domain"] = "Large Scale";
    }
  } else if (params.largeScaleAction == 'isolate') {
    for (let row of largeScaleRows) {
      row["_Domain"] = "Large Scale";
    }
    rows = largeScaleRows;
  }

  // Drop AlphaGo Zero
  if (params.bigAlphagoAction == 'remove') {
    for (let row of largeScaleRows) {
      if ("System" == "AlphaGo Zero" || "System" == "AlphaGo Master") {
        row.deleted = true;
      }
    }
  } else if (params.bigAlphagoAction == 'label') {
    for (let row of largeScaleRows) {
      if ("System" == "AlphaGo Zero" || "System" == "AlphaGo Master") {
        row._Domain = "AlphaGo Zero";
      }
    }
  }

  return rows;
}

function filterRecords(rows, params) {
  let allRecords = [];
  let recordRowsPerDomain = {};

  // TODO Record setters
  for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
    let row = rows[rowIndex];
    if (row.deleted) continue;

    let records = recordRowsPerDomain[row["_Domain"]];
    if (records == undefined) {
      records = [];
      recordRowsPerDomain[row["_Domain"]] = records;
    }

    if (records.length == 0 || row[params.yAxis] > records[records.length-1][params.yAxis]) {
      records.push(row);
      allRecords.push(row);
    }
  }

  if (params.recordSettersAction == 'isolate') {
    rows = allRecords;
  } else if (params.recordSettersAction == 'label') {
    for (let row of allRecords) row._Domain = "Record";
  }

  return rows;
}

function addEraInfo(rows, eras, params) {
  if (eras.length == 0) return;

  // Add era labels to each domain
  let currentEraIndex = 1; // skip the 'All' era
  let era = "Machine Learning Era";
  for (let row of rows) {
    if (row.deleted) continue;

    while (currentEraIndex < eras.length && (eras[currentEraIndex].Era == 'All' || !(eras[currentEraIndex].start <= row["Publication date"] && row["Publication date"] <= eras[currentEraIndex].stop))) {
      currentEraIndex++;
    }

    if (currentEraIndex == eras.length) break;

    if (params.splitDlEra) {
      era = eras[currentEraIndex].Era;
    }

    if (era == "Large Scale Era" && !params.splitLargeScaleEra) {
      era = 'Deep Learning Era';
    }

    if (params.domainsToNotSplit.includes(row._Domain)) {
      era = 'All';
    }

    row.Era = era;
    row._Era = eras[currentEraIndex];
  }
}

function extractEraDomains(eras, rows) {
  let added = new Set();
  let eraDomains = [];
  let currentGroup = [];

  let eraDomainToGroup = {};

  let nameToEra = {};
  for (let era of eras) {
    nameToEra[era.Era] = era;
  }

  for (let row of rows) {
    if (row.deleted) continue;

    let key = row.Era + ";" + row._Domain;
    if (!added.has(key)) {
      added.add(key);
      group = [];
      eraDomains.push([row.Era, row._Domain, group]);
      eraDomainToGroup[key] = group;
    }

    eraDomainToGroup[key].push(row);
  }

  eraDomains.sort((a, b) => {
    let eraA = nameToEra[a[0]];
    let eraB = nameToEra[b[0]];
    let domainA = a[1];
    let domainB = b[1];

    if (eraA.start < eraB.start) return -1;
    if (eraA.start > eraB.start) return +1;

    // eraA.start == eraB.start
    if (domainA < domainB) return -1;
    if (domainA > domainB) return +1;

    // a == b
    return 0;
  })

  return eraDomains;
}

function regressData(rows, eras, params) {
  let lines = [];
  let infoTable = [];

  for (let [era, domain, group] of extractEraDomains(eras, rows)) {
    if (group.length < 3) continue;

    let data = [];

    let minEra;
    let maxEra;
    let minX = Infinity;
    let maxX = -Infinity;

    let x = [];
    let y = [];

    for (let row of group) {
      let xv = (params.xAxis == "Publication date") ? dateToJulianDate(row["Publication date"]) : Math.log10(row[params.xAxis]);
      let yv = Math.log10(row[params.yAxis]);

      if (xv < minX) {minX = xv; minEra = row._Era};
      if (xv > maxX) {maxX = xv; maxEra = row._Era};

      x.push(xv);
      y.push(yv);
      data.push([xv, yv]);
    }

    // Collect information about the fit
    let info = {};
    info.era = era;
    info.domain = domain;
    info.n = data.length;

    let model = regression.linear(data, { order: 2, precision: null });
    let bestSlope = model.coeffs[0];

    let quantiles = {
      low:    0.025,
      median: 0.500,
      high:   0.975,
    };
    let bootstrappingResults = bootstrapping(x, y, params.bootstrapSampleSize, params.adjustForEstimateUncertainty, quantiles);

    let slopeSummary;
    let lowSlope = bootstrappingResults.quantiles.low;
    let medianSlope = bootstrappingResults.quantiles.median;
    let highSlope = bootstrappingResults.quantiles.high;

    if (params.xAxis == 'Publication date') {
      bestSlope *= DAYS_PER_YEAR;
      lowSlope *= DAYS_PER_YEAR;
      medianSlope *= DAYS_PER_YEAR;
      highSlope *= DAYS_PER_YEAR;
      info.Slope = `${bestSlope.toFixed(1)} OOMs/year [${lowSlope.toFixed(1)} ; ${medianSlope.toFixed(1)} ; ${highSlope.toFixed(1)}]`
      info.bestSlope = `${bestSlope.toFixed(1)} OOMs/year`
    } else {
      info.bestSlope = `${bestSlope.toExponential(1)}`
      info.Slope = `${bestSlope.toExponential(1)} [${lowSlope.toExponential(1)} ; ${medianSlope.toExponential(1)} ; ${highSlope.toExponential(1)}]`
    }


    // Doubling time
    if (params.xAxis == 'Publication date') {
      let doublingTimes = [];
      for (let slope of bootstrappingResults.slopes) {
        // TODO Zero slopes
        doublingTimes.push(Math.log10(2) / slope / DAYS_PER_MONTH);
      }

      let bestDoublingTime   = Math.log10(2) / model.coeffs[0] / DAYS_PER_MONTH;
      let lowDoublingTime    = quantile(doublingTimes, quantiles.low);
      let medianDoublingTime = quantile(doublingTimes, quantiles.median);
      let highDoublingTime   = quantile(doublingTimes, quantiles.high);

      info["Doubling time"] = `${bestDoublingTime.toFixed(1)} months [${lowDoublingTime.toFixed(1)} ; ${medianDoublingTime.toFixed(1)} ; ${highDoublingTime.toFixed(1)}]`;
    }

    info._slopes = bootstrappingResults.slopes;

    info.R2 = model.r2.toFixed(2);
    info._group = group; // For testing purposes

// ---> Model only, I think

    // Extract predictions

    let xPred; 
    if (params.xAxis == 'Publication date') {
      // Stretch datapoints to cover the corresponding era
      xPred = [dateToJulianDate(minEra.start), dateToJulianDate(maxEra.stop) - 0.0001];
    } else {
      xPred = [minX, maxX];
    }

    let yPred = [model.predict(xPred[0])[1], model.predict(xPred[1])[1]];

    // Postprocessing

    if (params.xAxis == 'Publication date') {
      xPred[0] = julianDateToDate(xPred[0]);
      xPred[1] = julianDateToDate(xPred[1]);
    } else {
      xPred[0] = 10.0**xPred[0];
      xPred[1] = 10.0**xPred[1];
    }

    yPred[0] = 10.0**yPred[0];
    yPred[1] = 10.0**yPred[1];

    info['Scale (start / end)'] = `${yPred[0].toExponential(0)} / ${yPred[1].toExponential(0)}`;

    infoTable.push(info);

    for (let i = 0; i < 2; i++) {
      lines.push({
        [params.xAxis]: xPred[i],
        [params.yAxis]: yPred[i],
        Domain: domain,
        visible: true,
      });
    }
  }

  lines.sort((a, b) => a[params.xAxis] - b[params.xAxis]);

  return {lines: lines, infoTable: infoTable};
}

function bootstrapping(x, y, sampleSize, adjustForEstimateUncertainty, quantiles) {
  quantiles ||= {
    low:    0.025,
    median: 0.500,
    high:   0.975,
  };

  let slopes = [];
  let n = x.length;

  // Bit of common processing
  let x2 = [];
  let xy = [];
  for (let i = 0; i < x.length; i++) {
    x2.push(x[i]**2);
    xy.push(x[i]*y[i]);
  }

  let sampleIndices = Array(n);

  for (let sampleIndex = 0; sampleIndex < sampleSize; sampleIndex++) {
    randomInts(n, n, sampleIndices);

    // We need at least 3 distinct points to do a linear regression

    let uniqueIndices = [];
    for (let i of sampleIndices) {
      if (!uniqueIndices.includes(i)) uniqueIndices.push(i);
      if (uniqueIndices.length >= 3) break;
    }

    if (uniqueIndices.length < 3) continue;

    /*
    let sumXS = 0;
    let sumYS = 0;
    let sumX2S = 0;
    let sumXYS = 0;
    for (let i of sampleIndices) {
      sumXS += x[i];
      sumYS += y[i];
      sumX2S += x2[i];
      sumXYS += xy[i];

      // TODO Understand this: Can we do this at the preprocessing or postprocessing?
      if (adjustForEstimateUncertainty) {
        let yNoise = randomFloat(Math.log10(1/2), Math.log10(2));
        sumYS += yNoise;
        sumXYS += x[i] * yNoise;
      }
    }

    let slope = (n*sumXYS - sumXS*sumYS)/(n*sumX2S - sumXS**2);
    slopes.push(slope);
    */

    let data = [];
    for (let i of sampleIndices) {
      let noise = adjustForEstimateUncertainty ? randomFloat(Math.log10(1/2), Math.log10(2)) : 0;
      data.push([x[i], y[i] + noise]);
    }

    let model = regression.linear(data, { order: 2, precision: null });
    let slope = model.coeffs[0];
    slopes.push(slope);
  }

  let quantileValues = {};

  sortNumberArray(slopes);
  for (let key in quantiles) {
    quantileValues[key] = quantile(slopes, quantiles[key], true);
  }

  return {slopes: slopes, quantiles: quantileValues};
}

///////////////////////////////////////////////////////////////////////////////
// Utilities
//////////////////////////////////////////////////////////////////////////////

function quantile(arr, q, sorted) {
  if (!sorted) {
    arr = arr.slice(); // clone the array
    sortNumberArray(arr);
  }

  let i = q * (arr.length - 1);
  let integerPart = Math.floor(i);
  let fractionalPart = i - integerPart;

  let left = arr[integerPart];
  let right = arr[Math.min(integerPart+1, arr.length-1)];

  return (1 - fractionalPart) * left + fractionalPart * right;
}

function sortNumberArray(arr) {
  return arr.sort((a, b) => a - b);
}

function randomFloat(min, max) {
  return min + Math.random() * (max - min);
}

// TODO Make this fast
function randomInts(upperLimit, count, samples) {
  if (samples === undefined) {
    samples = new Array(count);
  }

  for (let i = 0; i < count; i++) {
    samples[i] = Math.floor(Math.random() * upperLimit);
  }

  return samples;
}

// TODO Fix this
function parseDate(str) {
  let fields = str.split("/");

  let day = 1;
  let month = 1;
  let year;

  if (fields.length == 1) {
    year = fields[0];
  } else {
    day   = fields[0];
    month = fields[1];
    year  = fields[2];
  }

  return new Date(year, month - 1, day, 1, 0, 0, 0);
}

function print(obj) {
  console.log(obj);
}

function shallowCopy(obj) {
  return {...obj};
}

function deepCopy(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// TODO Check this!
function dateToJulianDate(date) {
  let month = date.getMonth() + 1;
  var x = Math.floor((14 - month)/12);
  var y = date.getFullYear() + 4800 - x;
  var z = month - 3 + 12 * x;

  var n = date.getDate() + Math.floor(((153 * z) + 2)/5) + (365 * y) + Math.floor(y/4) + Math.floor(y/400) - Math.floor(y/100) - 32045;

  return n;
}   

function julianDateToDate(julianDate) {
  // https://stackoverflow.com/a/26371251

  let epoch = 2440587.5; // 1970-01-01 00:00 (one would hope)
  let millis = (julianDate - 2440587.5) * 86400000;
  let date = new Date(millis);

  return date;
}
