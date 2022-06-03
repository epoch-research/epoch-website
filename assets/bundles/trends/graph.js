function buildTrendsGraph(container, database, args) {
  'use strict';

  let eraColors = ["#e5ae38", "#30a2da", "#fc4f30"];

  args = args || {};
  let linkParamsToUrl = args.linkParamsToUrl;

  if (typeof container == 'string') {
    let selector = container;
    container = document.querySelector(selector);
  }

  let possibleXAxes = [
    "Publication date",
    "Parameters",
    "Training compute (FLOPs)",
    "Inference compute (FLOPs)",
    "Training compute per parameter (FLOPs)",
    "Training compute times parameters",
  ];

  let possibleYAxes = [
    "Parameters",
    "Training compute (FLOPs)",
    "Inference compute (FLOPs)",
    "Training compute per parameter (FLOPs)",
    "Training compute times parameters",
  ];

  /////////////////////////////////////////////////////
  // Misc stuff, I guess
  /////////////////////////////////////////////////////

  function drawStar(context, shapeSize) {
    shapeSize = 7;
    context.moveTo(0*shapeSize, 0.5*shapeSize);
    context.lineTo(0.6*shapeSize, 0.8*shapeSize);
    context.lineTo(0.5*shapeSize, 0.1*shapeSize);
    context.lineTo(1*shapeSize, -0.3*shapeSize);
    context.lineTo(0.3*shapeSize, -0.4*shapeSize);
    context.lineTo(0*shapeSize, -1*shapeSize);
    context.lineTo(-0.3*shapeSize, -0.4*shapeSize);
    context.lineTo(-1*shapeSize, -0.3*shapeSize);
    context.lineTo(-0.5*shapeSize, 0.1*shapeSize);
    context.lineTo(-0.6*shapeSize, 0.8*shapeSize);
    context.lineTo(0*shapeSize, 0.5*shapeSize);
    context.closePath();
  }

  let domainStyles = {
    'Vision':       ['#6d904f', 'cross'],
    'Language':     ['#b96db8', 'square'],
    'Games':        ['#30a2da', 'circle'],
    'Drawing':      ['#8b8b8b', drawStar],
    'Speech':       ['#ff9e27', 'triangle-down'],
    'Other':        ['#e5ae38', 'diamond'],
    'Large Scale':  ['#fc4f30', 'triangle'],
    'Outlier':      ['#56cc60', 'triangle-left'],
    'Record':       ['#bfc11b', 'triangle-up'],
    'AlphaGo Zero': ['#ff9e27', drawStar],

    // Set these
    'Driving':        ['#279eff', drawStar],
    'Recommendation': ['#9e27ff', drawStar],
    'Video':          ['#279e27', drawStar],
    'Multimodal':     ['#ff0000', drawStar],
    'Search':         ['#00ff00', drawStar],
    'Robotics':       ['#0000ff', drawStar],

    // All
    'All':          ['#30a2da', 'circle'],
  };

  /////////////////////////////////////////////////////
  // Utilities
  /////////////////////////////////////////////////////

  function toExponential(x) {
    if (Number.isNaN(+x)) return '--';
    return (+x).toExponential();
  }

  function serializeDate(date) {
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  }

  function deserializeDate(str) {
    let fields = str.split('-');
    return mlp.date(fields[0], fields[1], fields[2]);
  }

  function _(parent, selector) {
    return parent.querySelector(selector);
  }

  let html = mlp.html;

  function getUrlParams(options) {
    options = {...options};

    let urlParamNames = [];
    let search = window.location.search.substring(1);

    if (search.length > 0) {
      let urlParams = JSON.parse('{"' + search.replace(/&/g, '","').replace(/=/g,'":"') + '"}', function(key, value) { return key===""?value:decodeURIComponent(value) })

      for (let [key, value] of Object.entries(urlParams)) {
        if (!(key in options)) continue;

        if (typeof(options[key]) == "boolean") {
          value = (value == "true") ? true : false;
        } else if (options[key] instanceof Date) {
          value = deserializeDate(value);
        } else if (Array.isArray(options[key])) {
          let values = [];
          for (let field of value.split(',')) {
            values.push(parseFloat(field));
          }
          value = values;
        } else {
          value = (options[key].constructor)(value);
        }
        options[key] = value;
        urlParamNames.push(key);
      }
    }
    return options;
  }

  function setUrlParams(options) {
    let urlFields = [];

    for (let option in options) {
      let value = options[option];
      if (value instanceof Date) value = serializeDate(value);
      urlFields.push(option + "=" + value);
    }

    // TODO There is a bug in Chrome that causes the cursor to blink when moving the multislider handles if you call replaceState.
    // It's pretty annoying. Is there a workaround?
    let urlSearchParams = urlFields.join("&");
    window.history.replaceState('page', 'Title', "?" + urlSearchParams);
  }

  function buildModal(label, values, parent) {
    let modalNode = mlp.html(`
      <div class="modal" id="x-axis-modal">
        <div class="modal-bg modal-exit"></div>
        <div class="modal-container">
          <h2>${label}</h2>
          <div class="button-group">
          </div>
          <button class="modal-close modal-exit">X</button>
        </div>
      </div>
    `);

    let buttonGroup = _(modalNode, ".button-group");
    let firstButton = true;
    for (let value of values) {
      buttonGroup.appendChild(mlp.html(`<button class="button-item" type="button" data-value="${value}">${value}</button>`));
      if (firstButton) buttonGroup.classList.add("selected")
      firstButton = false;
    }

    (parent || document.body).appendChild(modalNode);

    let modal = new Modal(modalNode);
    return modal;
  }

  /////////////////////////////////////////////////////
  // Initialization
  /////////////////////////////////////////////////////

  database = init(database);

  /////////////////////////////////////////////////////
  // Driver
  /////////////////////////////////////////////////////

  let v = new mlp.Plotter(container);
  let plotter = v;

  let objectToSystem = new Map();      // Graphical object --> system info 
  let slopeObjectToDomain = new Map(); // Graphical slope object --> regression data row
  let slopeTextToInfo = new Map(); // Graphical slope object --> regression data row

  let result;

  plotter.setObjectTooltip((object, pointer) => {
    let tooltip = null;

    if (object instanceof mlp.Point) {
      let system = objectToSystem.get(object);
      if (system) {
        tooltip = {};
        tooltip.dom = plotter.buildTooltipTable([
            {label: "System",                    value: system["System"]},
            {label: "Organization(s)",           value: system["Organization(s)"]},
            {label: "Author(s)",                 value: system["Author(s)"]},
            {label: "Reference",                 value: system["Reference"]},
            {label: "Publication date",          value: system["Publication date"].toLocaleString('en-us',{month:'short', day: 'numeric', year:'numeric'})},
            {label: "Parameters",                value: toExponential(system["Parameters"])},
            {label: "Training compute (FLOPs)",  value: toExponential(system["Training compute (FLOPs)"])},
            {label: "Inference compute (FLOPs)", value: toExponential(system["Inference compute (FLOPs)"])},
            {label: "Domain",                    value: system["_Domain"]},
        ]);
      }
    } else if (object instanceof mlp.Polyline || slopeTextToInfo.has(object)) {
      let dom = mlp.html('<div><div>');

      let domain;
      let p = plotter.mainArea.canvasToPaper(pointer);
      let era;
      if (slopeTextToInfo.has(object)) {
        let slopeInfo = slopeTextToInfo.get(object);
        if (slopeInfo) domain = slopeInfo.domain;
        if (slopeInfo) era = slopeInfo.era;
      } else {
        domain = slopeObjectToDomain.get(object);
      }

      function renderTooltip(dom, domain, era, p) {
        dom.innerHTML = '';

        let slopeInfo = getSlopeInfo(domain, era, params.xAxis);
        if (!slopeInfo) {
          slopeInfo = getClosestSlopeInfo(domain, p, params.xAxis);
        }

        if (slopeInfo) {
          let tableRows = [];
          tableRows.push({label: "Slope",               value: slopeInfo.Slope});
          if (params.xAxis == 'Publication date') {
          tableRows.push({label: "Doubling time",       value: slopeInfo['Doubling time']});
          tableRows.push({label: "Era",                 value: slopeInfo.era});
          }
          tableRows.push({label: "Domain",              value: slopeInfo.domain});
          tableRows.push({label: "Number of systems",   value: slopeInfo.n});
          tableRows.push({label: "Scale (start / end)", value: slopeInfo['Scale (start / end)']});
          tableRows.push({label: "R2",                  value: slopeInfo["R2"]});

          dom.appendChild(plotter.buildTooltipTable(tableRows));

          let checkboxWrapper = mlp.html('<label>Split regression by era</label>');
          let checkbox = mlp.html(`<input type="checkbox" ${params.domainsToNotSplit.includes(slopeInfo.domain) ? '' : 'checked'}></input>`);
          checkboxWrapper.prepend(checkbox);
          checkbox.addEventListener('input', () => {
            let domainsToNotSplit = [...params.domainsToNotSplit];
            if (checkbox.checked) {
              mlp.removeFromArray(domainsToNotSplit, slopeInfo.domain);
            } else {
              mlp.addToArray(domainsToNotSplit, slopeInfo.domain);
            }
            v.setOptions({domainsToNotSplit: domainsToNotSplit});
            renderTooltip(dom, domain, era, p);
          });

          dom.prepend(checkboxWrapper);

          return true;
        }

        return false;
      }

      if (renderTooltip(dom, domain, era, p)) {
        tooltip = {
          dom: dom,
          pinnable: true,
        }
      }
    }

    return tooltip;
  });

  function getEraNameAtPoint(p, xAxis) {
    let eraAtPoint;

    if (xAxis == 'Publication date') {
      let d = mlp.julianDateToDate(p.x);
      for (let era of result.eras) {
        if (era.Era == 'All') continue;
        if (era.start <= d && d < era.stop) {
          eraAtPoint = era.Era;
          break;
        }
      }
    }

    return eraAtPoint;
  }

  function getSlopeInfo(domain, era, xAxis) {
    let slopeInfo = null;
    for (let row of result.regressionInfoTable) {
      if (row.domain == domain) {
        if (xAxis != 'Publication date' || row.era == 'All' || row.era == era) {
          slopeInfo = row;
          break;
        }
      }
    }

    return slopeInfo;
  }

  function getClosestSlopeInfo(domain, p, xAxis) {
    // TODO This should change
    let eraNameToEra = {};

    for (let era of result.eras) {
      eraNameToEra[era.Era] = era;
    }

    let minDistance = Infinity;
    let closestSlopeInfo;

    for (let row of result.regressionInfoTable) {
      if (row.domain == domain) {
        if (xAxis != 'Publication date') {
          closestSlopeInfo = row;
          break;
        }

        let d = mlp.julianDateToDate(p.x);
        let era = eraNameToEra[row.era];

        if (era.start <= d && d < era.stop) {
          closestSlopeInfo = row;
          break;
        }

        let distance = Math.min(Math.abs(d - era.start), Math.abs(d - era.stop));
        if (distance < minDistance) {
          minDistance = distance;
          closestSlopeInfo = row;
        }
      }
    }

    return closestSlopeInfo;
  }

  /*
  plotter.on('hover', args => {
    if (args.mouseLeaveObject) {
      if (args.mouseLeaveObject instanceof mlp.Point) {
        args.mouseLeaveObject.fill = '';
        plotter.requestRenderAll();
      }
    }

    if (args.mouseEnterObject) {
      if (args.mouseEnterObject instanceof mlp.Point) {
        args.mouseEnterObject.fill = 'red';
        plotter.requestRenderAll();
      }
    }
  });
  */

  //
  // Export buttons
  //

  let exportButton = html('<div class="exportButton over-button" id="exportButton">⭳</div>');
  let csvDownload = '<button id="databaseDownload">Download dataset</button>';
  let pngDownload = '<button id="graphDownload">Download graph</button>';
  exportButton.appendChild(html('<ul class="dropdown"><li>'+ csvDownload +'</li><li>'+ pngDownload +'</li></ul>'));

  let dropdown = _(exportButton, ".dropdown");
  dropdown.style.visibility = "hidden";

  exportButton.addEventListener("click", function() {
    dropdown.style.visibility = (_(exportButton, ".dropdown").style.visibility == "visible") ? "hidden" : "visible";
  });

  document.addEventListener("click", function(e) {
    if (e.target != exportButton) {
      dropdown.style.visibility = "hidden";
    }
  });

  _(exportButton, "#databaseDownload").addEventListener("click", function() {
    let link = document.createElement('a');
    let url = "https://docs.google.com/spreadsheets/d/1AAIebjNsnJj_uKALHbXNfn3_YsT6sHXtCU0q7OIPuc4/export?format=csv#gid=0";
    link.setAttribute('href', url);
    link.setAttribute('target', '_blank');
    link.setAttribute('download', 'trends.csv');
    link.dispatchEvent(new MouseEvent('click'));
  });

  _(exportButton, "#graphDownload").addEventListener("click", function() {
    // TODO To implement
    if (visualizer.view) {
      visualizer.view.toImageURL('png').then(function(url) {
        let link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('target', '_blank');
        link.setAttribute('download', 'trends.png');
        link.dispatchEvent(new MouseEvent('click'));
      }).catch(function(error) {});
    }
  });

  plotter.nodes.graph.appendChild(exportButton);

  //
  // Legend
  //

  let domainsDisabled = {
      'Vision'         : false,
      'Language'       : false,
      'Games'          : false,
      'Drawing'        : false,
      'Speech'         : false,
      'Other'          : false,
      'Large Scale'    : false,
      'All'            : false,
      'Outlier'        : false,
      'Record'         : false,
      'AlphaGo Zero'   : false,
      'Driving'        : false,
      'Recommendation' : false,
      'Video'          : false,
      'Multimodal'     : false,
      'Search'         : false,
      'Robotics'       : false,
  };

  v.on('legendItemClick', args => {
    let domain = args.legendItem.dataset.value;
    domainsDisabled[domain] = !domainsDisabled[domain];
    if (domainsDisabled[domain]) {
      v.getLegendItem(domain).classList.add("disabled");
    } else {
      v.getLegendItem(domain).classList.remove("disabled");
    }

    updateVisibility();
  });

  //
  // Controls
  //

  let presetSelector = new mlp.SelectControl({
    label: "Preset",
    param: "preset",
  });

  for (let preset of presets) {
    presetSelector.addItem(preset.name);
  }

  presetSelector.on("change", () => {
    for (let preset of presets) {
      if (preset.name == presetSelector.getValue()) {
        v.setOptions(preset.params);
        break;
      }
    }
  });

  v.addControl(presetSelector);

  v.addMultiDateSlider(["startDate", "startDlEra", "startLargeScaleEra", "endDate"],
    [
      {value: mlp.date(1950, 1, 1), background: `linear-gradient(90deg, #888 50%, ${eraColors[0]} 50%)`},
      {value: mlp.date(1970, 1, 1), background: `linear-gradient(90deg, ${eraColors[0]} 50%, ${eraColors[1]} 50%)`},
      {value: mlp.date(1985, 1, 1), background: `linear-gradient(90deg, ${eraColors[1]} 50%, ${eraColors[2]} 50%)`},
      {value: mlp.date(2023, 1, 1), background: `linear-gradient(90deg, ${eraColors[2]} 50%, #888 50%)`},
    ],
    [
      {color: eraColors[0]},
      {color: eraColors[1]},
      {color: eraColors[2]},
    ],
    [
      mlp.date(1950, 1, 1),
      mlp.date(new Date().getFullYear() + 2, 1, 1),
    ]
  );

  v.addControl(new mlp.SelectControl({
    label: "X axis",
    param: "xAxis",
    defaultValue: "Publication date",
    values: possibleXAxes,
  }));

  v.addControl(new mlp.SelectControl({
    label: "Y axis",
    param: "yAxis",
    defaultValue: "Parameters",
    values: possibleYAxes,
  }));

  v.addControl(mlp.newCheckControl("Plot regressions",     "plotRegressions",    true));
  v.addControl(mlp.newCheckControl("Separate by category", "separateCategories", true));
  v.addControl(mlp.newCheckControl("Label eras",           "labelEras",          true));
  v.addControl(mlp.newCheckControl("Show doubling times",  "showDoublingTimes",  true));
  v.addControl(mlp.newCheckControl("Label systems",        "labelSystems",       false));

  // Thresholds

  v.addControl(mlp.newNumberControl("Low Z value",        "lowOutliersZValueThreshold",  0));
  v.addControl(mlp.newNumberControl("High Z value",       "highOutliersZValueThreshold", 0));
  v.addControl(mlp.newNumberControl("Window size",        "outlierWindowSize",           2));
  v.addControl(mlp.newNumberControl("Citation threshold", "citationThreshold",           0));
  v.addControl(mlp.newNumberControl("Others threshold",   "otherDomainThreshold",        10));

  // Outliers actions

  v.addControl(mlp.newSelectControl("Outliers",       "outliersAction",      "ignore", ["ignore", "label", "remove"]));
  v.addControl(mlp.newSelectControl("Large scale",    "largeScaleAction",    "ignore", ["ignore", "label", "isolate"]));
  v.addControl(mlp.newSelectControl("Big AlphaGo",    "bigAlphagoAction",    "ignore", ["ignore", "label", "remove"]));
  v.addControl(mlp.newSelectControl("Record setters", "recordSettersAction", "ignore", ["ignore", "label", "isolate"]));

  // Bootstrapping

  v.addControl(mlp.newNumberControl("Bootstrap sample size", "bootstrapSampleSize", 10));
  v.addControl(mlp.newCheckControl("Adjust for estimate uncertainty", "adjustForEstimateUncertainty", true));

  // Ranges filter

  v.addControl(mlp.newNumberRangeControl("Parameters range",                        "parametersRange"));
  v.addControl(mlp.newNumberRangeControl("Training compute range",                  "trainingComputeRange"));
  v.addControl(mlp.newNumberRangeControl("Inference compute range",                 "inferenceComputeRange"));
  v.addControl(mlp.newNumberRangeControl("Inference compute per parameter range",   "inferenceComputePerParameterRange"));
  v.addControl(mlp.newNumberRangeControl("Inference compute times parameter range", "inferenceComputeTimesParameterRange"));

  // Misc filters

  v.addControl(mlp.newTextControl("Filter by text", "filterText"));

  // Make the system aware of the domainsToNotSplit option
  v.setOptions({domainsToNotSplit: []});

  if (presets.length > 0 ) {
    v.setOptions(presets[0].params);
  }

  // Oh, Jesus, sweet Jesus

  let options = v.options;
  if (linkParamsToUrl) options = getUrlParams(v.options);
  v.setOptions(options);

  // TODO This needs to be set differently
  v.setLegend([
    {name: 'Vision',         color: '#6d904f', shape: '#cross'},
    {name: 'Language',       color: '#b96db8', shape: '#square'},
    {name: 'Games',          color: '#30a2da', shape: '#circle'},
    {name: 'Drawing',        color: '#8b8b8b', shape: 'M0,.5L.6,.8L.5,.1L1,-.3L.3,-.4L0,-1L-.3,-.4L-1,-.3L-.5,.1L-.6,.8L0,.5Z'},
    {name: 'Speech',         color: '#ff9e27', shape: '#triangle-down'},
    {name: 'Other',          color: '#e5ae38', shape: '#diamond'},
    {name: 'Large Scale',    color: '#fc4f30', shape: '#triangle'},
    {name: 'All',            color: '#30a2da', shape: '#circle'},
    {name: 'Outlier',        color: '#56cc60', shape: '#triangle-left'},
    {name: 'Record',         color: '#bfc11b', shape: '#triangle-up'},
    {name: 'AlphaGo Zero',   color: '#ff9e27', shape: 'M0,.5L.6,.8L.5,.1L1,-.3L.3,-.4L0,-1L-.3,-.4L-1,-.3L-.5,.1L-.6,.8L0,.5Z'},

    {name: 'Driving',        color: '#279eff', shape: 'M0,.5L.6,.8L.5,.1L1,-.3L.3,-.4L0,-1L-.3,-.4L-1,-.3L-.5,.1L-.6,.8L0,.5Z'},
    {name: 'Recommendation', color: '#9e27ff', shape: 'M0,.5L.6,.8L.5,.1L1,-.3L.3,-.4L0,-1L-.3,-.4L-1,-.3L-.5,.1L-.6,.8L0,.5Z'},
    {name: 'Video',          color: '#279e27', shape: 'M0,.5L.6,.8L.5,.1L1,-.3L.3,-.4L0,-1L-.3,-.4L-1,-.3L-.5,.1L-.6,.8L0,.5Z'},
    {name: 'Multimodal',     color: '#ff0000', shape: 'M0,.5L.6,.8L.5,.1L1,-.3L.3,-.4L0,-1L-.3,-.4L-1,-.3L-.5,.1L-.6,.8L0,.5Z'},
    {name: 'Search',         color: '#00ff00', shape: 'M0,.5L.6,.8L.5,.1L1,-.3L.3,-.4L0,-1L-.3,-.4L-1,-.3L-.5,.1L-.6,.8L0,.5Z'},
    {name: 'Robotics',       color: '#0000ff', shape: 'M0,.5L.6,.8L.5,.1L1,-.3L.3,-.4L0,-1L-.3,-.4L-1,-.3L-.5,.1L-.6,.8L0,.5Z'},
  ]);

  let eraPolylines = [];
  let eraLabels = [];
  let slopeTexts = [];

  function updateVisibility() {
    for (let entry of objectToSystem.entries()) {
      let object = entry[0];
      let system = entry[1];

      let visible = system.visible && !domainsDisabled[system._Domain];
      if (object instanceof mlp.Text && !params.labelSystems) {
        visible = false;
      }

      object.visible = visible;
    }

    for (let entry of slopeTextToInfo.entries()) {
      let text = entry[0];
      let domain = entry[1].domain;
      text.visible = params.showDoublingTimes && !domainsDisabled[domain];
    }

    for (let entry of slopeObjectToDomain.entries()) {
      let slope = entry[0];
      let domain = entry[1];
      slope.visible = !domainsDisabled[domain];
    }

    for (let poly of eraPolylines) {
      poly.visible = params.labelEras;
    }

    for (let label of eraLabels) {
      label.text.visible = params.labelEras;
    }

    plotter.requestRenderAll();
  }

  plotter.on("beforeRender", args => {
    // Update the slope texts
    for (let {text, p, q, slopeInfo} of slopeTexts) {
      let a = plotter.paperToCanvas(p);
      let b = plotter.paperToCanvas(q);
      text.rotation = -Math.atan2(b.y - a.y, b.x - a.x) * 180/Math.PI;
    }

    // Update the era polylines
    let y0 = plotter.yAxisArea.canvasToPaper({y: plotter.yAxisArea.bounds().y0}).y;
    let y1 = plotter.yAxisArea.canvasToPaper({y: plotter.yAxisArea.bounds().y1}).y;
    for (let polyline of eraPolylines) {
      polyline.paperPoints[0].y = y0;
      polyline.paperPoints[1].y = y0;
      polyline.paperPoints[2].y = y1;
      polyline.paperPoints[3].y = y1;
    }

    // Update the era labels
    for (let label of eraLabels) {
      let text = label.text;
      let interval = label.interval;
      let areaBounds = text.area.bounds().clone();

      text.area.context.save();
      text.area.context.font = (text.fontWeight || 'bold') + ' ' + (text.fontSize || 14) + 'px ' + (text.fontFamily || 'sans');
      let textBounds = mlp.rect(mlp.getTextBounds(text.area.context, text.text));
      text.area.context.restore();

      let rotatedTextBounds = mlp.rect(textBounds);
      if (text.rotation == 90) { // Gee
        rotatedTextBounds = mlp.rect({x0: textBounds.y0, y0: textBounds.x1, x1: textBounds.y1, y1: textBounds.x0});
      }

      let verticalStripBounds = plotter.dataToCanvasRect(text.area, mlp.rect({x0: interval[0], x1: interval[1]})).clone();

      let margin = 10;
      areaBounds.setX(areaBounds.x0 + margin);
      areaBounds.setW(areaBounds.w - 2*margin);
      areaBounds.setY(areaBounds.y0 + 20);
      areaBounds.setH(areaBounds.h - 2*margin);
      verticalStripBounds.setX(verticalStripBounds.x0 + margin);
      verticalStripBounds.setW(verticalStripBounds.w - 2*margin);

      // The label must fall inside both the areaBounds and the verticalStripBounds

      // TODO Automatic positioning (top/bottom and left/right)?

      text.visible = params.labelEras && (verticalStripBounds.w > rotatedTextBounds.w);

      let y = areaBounds.y1 - 20;
      let x = verticalStripBounds.x1;

      x = Math.max(x, areaBounds.x0);
      x = Math.min(x, areaBounds.x1 - rotatedTextBounds.w);
      x = Math.max(x, verticalStripBounds.x0);
      x = Math.min(x, verticalStripBounds.x1 - rotatedTextBounds.w);

      text.position = plotter.mainArea.canvasToPaper({x, y});
    }
  });

  //
  // Modals
  //

  // Oh, gee, this is awful. (We need the container to be 'absolute' or 'relative' positioned for our 'absolute' modals to work.)
  if (container.style.position == "") {
    container.style.position = "relative";
  }

  let xAxisModal = buildModal("X axis", possibleXAxes, container);
  let yAxisModal = buildModal("Y axis", possibleYAxes, container);

  let xButtonGroup = xAxisModal.element.getElementsByClassName("button-group")[0];
  let xButtons = xButtonGroup.getElementsByTagName("button");
  for (let button of xButtons) {
    button.addEventListener("click", function (event) {
      for (let b of xButtons) {
        b.classList.remove('selected');
      }

      button.classList.add('selected');

      v.setOptions({xAxis: button.dataset.value});
      onChange({options: v.options});
    });
  }

  let yButtonGroup = yAxisModal.element.getElementsByClassName("button-group")[0];
  let yButtons = yButtonGroup.getElementsByTagName("button");
  for (let button of yButtons) {
    button.addEventListener("click", function (event) {
      for (let b of yButtons) {
        b.classList.remove('selected');
      }

      button.classList.add('selected');

      v.setOptions({yAxis: button.dataset.value});
      onChange({options: v.options});
    });
  }

  plotter.on('click', args => {
    if (args.object == plotter.yAxisLabel) {
      yAxisModal.open();
      plotter.canvas.fire('mouseout', {});
    }

    if (args.object == plotter.xAxisLabel) {
      xAxisModal.open();
      plotter.canvas.fire('mouseout', {});
    }
  })

  //
  // On update
  //

  let prevXAxis = "";
  let prevYAxis = "";

  let prevParams = {};

  v.on('optionsChanged', onChange);
  onChange({options: params});

  function updateLegendVisibility() {
    v.showLegend(v.mainArea.bounds().w > 500);
  }

  v.canvas.on('resize', updateLegendVisibility);
  updateLegendVisibility();

  v.xAxisLabel.cursor = 'pointer';
  v.yAxisLabel.cursor = 'pointer';

  function onChange(args) {
    let axesUpdated = (prevParams.xAxis != args.options.xAxis) || (prevParams.yAxis != args.options.yAxis);
    let resetCamera = false;

    // If some option other than domainsToNotSplit has changed, reset the camera
    if (args.objectsUpdated) {
      for (let option of args.objectsUpdated) {
        if (option != 'domainsToNotSplit') {
          resetCamera = true;
          break;
        }
      }
    } else {
      resetCamera = true;
    }

    prevParams = {...params};
    params = {...params, ...args.options};

    for (let button of xButtonGroup.getElementsByTagName("button")) {
      if (button.dataset.value == params.xAxis) {
        button.classList.add("selected");
      } else {
        button.classList.remove("selected");
      }
    }

    for (let button of yButtonGroup.getElementsByTagName("button")) {
      if (button.dataset.value == params.yAxis) {
        button.classList.add("selected");
      } else {
        button.classList.remove("selected");
      }
    }

    // Sigh

    params.ranges['Parameters'][0] = args.options.parametersRange[0];
    params.ranges['Parameters'][1] = args.options.parametersRange[1];

    params.ranges['Training compute (FLOPs)'][0] = args.options.trainingComputeRange[0];
    params.ranges['Training compute (FLOPs)'][1] = args.options.trainingComputeRange[1];

    params.ranges['Inference compute (FLOPs)'][0] = args.options.inferenceComputeRange[0];
    params.ranges['Inference compute (FLOPs)'][1] = args.options.inferenceComputeRange[1];

    params.ranges['Inference compute per parameter (FLOPs)'][0] = args.options.inferenceComputePerParameterRange[0];
    params.ranges['Inference compute per parameter (FLOPs)'][1] = args.options.inferenceComputePerParameterRange[1];

    params.ranges['Inference compute times parameters'][0] = args.options.inferenceComputeTimesParameterRange[0];
    params.ranges['Inference compute times parameters'][1] = args.options.inferenceComputeTimesParameterRange[1];

    if (linkParamsToUrl) setUrlParams(params);

    result = generateGraph(database, params);

    //
    // Update the visualizer
    //

    let fieldsToCheck = [
      "System",
      "Reference",
      "_Domain",
      "Organization(s)",
      "Author(s)",
      "Publication date",
    ];

    function filteredOut(row, filterText, fieldsToCheck) {
      if (!filterText) return false;

      let regex = new RegExp(filterText, "gi")

      for (let field of fieldsToCheck) {
        if (!(field in row)) {
          continue;
        }

        if (row[field].toString().match(regex)) {
          return false;
        }
      }

      return true;
    }

    for (let row of result.systems) {
      row.visible = true;
      if (!row.deleted && filteredOut(row, params.filterText, fieldsToCheck)) {
        row.visible = false;
      }
    }

    //
    // Update the visualizer
    //

    objectToSystem.clear();
    slopeObjectToDomain.clear();
    slopeTextToInfo.clear();
    v.clear();

    v.inputCoords = mlp.CoordSystem.DATA;

    if (axesUpdated) {
      v.setXAxis({
        scaleType: (params.xAxis == 'Publication date') ? mlp.ScaleType.TIME : mlp.ScaleType.LOG,
        label: params.xAxis,
      });

      v.setYAxis({
        scaleType: mlp.ScaleType.LOG,
        label: params.yAxis,
      });
    }

    //
    // Eras
    //

    eraPolylines.length = 0;
    eraLabels.length = 0;
    slopeTexts.length = 0;

    function addEra(era, color, backgroundColor) {
      let interval = [era.start, era.stop];
      let polyline = plotter.addPolyline([
        {x: interval[0]},
        {x: interval[1]},
        {x: interval[1]},
        {x: interval[0]},
      ], {
        stroke: null,
        fill: backgroundColor,
        interactive: false,
      });

      let text = plotter.addText(era.Era, {
        rotation: 90,
        fontSize: 14,
        fill: color,
        normalizedBasePoint: {x: 0, y: 1},
        //rotation: 0,
        //normalizedBasePoint: {x: 0.5, y: 0},
        interactive: false,
      });

      eraLabels.push({text: text, interval: interval, era: era});
      eraPolylines.push(polyline);
    }

    if (params.xAxis == "Publication date") {
      let eraColorIndex = 0;

      for (let era of result.eras) {
        if (era.Era == 'All') continue;
        let textColor = eraColors[eraColorIndex];
        let backgroundColor = eraColors[eraColorIndex] + "22"; // era color with transparency
        addEra(era, textColor, backgroundColor);
        eraColorIndex++;
      }
    }

    //
    // Regressions
    //

    if (params.plotRegressions) {
      let domainToPoints = {};
      for (let row of result.regressionData) {
        if (!row.visible) continue;
        if (!(row.Domain in domainToPoints)) domainToPoints[row.Domain] = [];

        domainToPoints[row.Domain].push({x: row[params.xAxis], y: row[params.yAxis]});
      }

      for (let domain in domainToPoints) {
        let style = domainStyles[domain];
        if (!style) style = ['black', 'triangle-down'];

        let color = style[0];

        let points = domainToPoints[domain];

        let objectGroup = 'regression-' + domain;

        let poly = v.addPolyline(points, {
          stroke: color,
          group: objectGroup,
          cursor: 'pointer',
        });

        // TODO Make this better, less hacky!
        for (let i = 0; i < points.length - 1; i++) {
          let p = {...points[i]};
          let q = {...points[i + 1]};

          if (q.x - p.x <= 2*86400) continue;

          let px = plotter.xAxis.dataToPaper(p.x);
          let py = plotter.yAxis.dataToPaper(p.y);

          let qx = plotter.xAxis.dataToPaper(q.x);
          let qy = plotter.yAxis.dataToPaper(q.y);

          let cx = 0.5 * (px + qx);
          let cy = 0.5 * (py + qy);

          let slopeInfo = getSlopeInfo(domain, getEraNameAtPoint({x: cx, y: cy}, params.xAxis), params.xAxis);
          if (!slopeInfo) continue;

          cx = plotter.xAxis.paperToData(cx);
          cy = plotter.yAxis.paperToData(cy);

          let text = plotter.addText(slopeInfo.bestSlope, {
            position: {x: cx, y: cy},
            normalizedBasePoint: {x: 0.5, y: 0},
            fill: color,
            group: objectGroup,
            cursor: 'pointer',
          });

          slopeTextToInfo.set(text, slopeInfo);
          slopeTexts.push({
            text: text,
            p: {x: px, y: py},
            q: {x: qx, y: qy},
            slopeInfo: slopeInfo
          });
        }

        slopeObjectToDomain.set(poly, domain);
      }
    }

    //
    // Systems
    //

    let domainsInResult = new Set();

    for (let system of result.systems) {
      let style = domainStyles[system._Domain];
      if (!style) style = ['red', 'triangle-down'];

      let point = v.addPoint(system[params.xAxis], system[params.yAxis], {
        stroke: style[0],
        shape: style[1],
      });

      let label = v.addText(system.System, {
        position: {x: system[params.xAxis], y: system[params.yAxis]},
        fontSize: 12,
        fill: style[0],
        normalizedBasePoint: {x: 1, y: 0.5},
        offset: {x: -10, y: 0},
        interactive: false,
      });

      objectToSystem.set(point, system);
      objectToSystem.set(label, system);

      domainsInResult.add(system._Domain);
    }

    for (let legendItem of plotter.getLegendItems()) {
      let domain = legendItem.dataset.value;
      if (domainsInResult.has(domain)) {
        legendItem.style.display = '';
      } else {
        legendItem.style.display = 'none';
      }
    }

    updateVisibility();

    //
    // Camera stuff
    //

    if (resetCamera) {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      for (let i = 0; i < result.systems.length; i++) {
        let system = result.systems[i];

        if (system.deleted || !system.visible) continue;

        let x = system[params.xAxis];
        let y = system[params.yAxis];

        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;

        system._x = x;
        system._y = y;
      }

      // TODO TMP Is this OK?
      /*
      if (params.xAxis == "Publication date") {
        minX = params.startDate;
        maxX = params.endDate;
      }
      */

      if (minX instanceof Date) {
        let minTime = minX.getTime();
        let maxTime = maxX.getTime();
        let margin = Math.max(86400e3, 0.01 * (maxTime - minTime));
        margin = 0;

        minX = new Date(minTime - margin);
        maxX = new Date(maxTime + margin);
      };

      v.setCamera({x0: minX, y0: minY / 1.5, x1: maxX, y1: maxY * 1.5});
    }

    v.requestRenderAll();
  }
}

