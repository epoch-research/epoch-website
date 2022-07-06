(function () {
  'use strict';

  mlp.ScaleType = mlp.createEnum({
    LINEAR: 0,
    LOG:    1,
    TIME:   2,
  });

  mlp.AxisDirection = mlp.createEnum({
    VERTICAL:   0,
    HORIZONTAL: 1,
  });

  mlp.CoordSystem = mlp.createEnum({
    DATA:   0,
    PAPER:  1,
    CANVAS: 2,
  });

  mlp.Axis = mlp.createClass({
    scaleType: mlp.ScaleType.LINEAR,

    label: "",

    // Base of log scales
    logBase: 10,

    direction: mlp.AxisDirection.HORIZONTAL,

    area: undefined,

    initialize: function(options) {
      this.set(options);
    },

    set: function(options) {
      if ("scaleType" in options) this.scaleType = options.scaleType;
      if ("logBase" in options)   this.logBase   = options.logBase;
      if ("direction" in options) this.direction = options.direction;
      if ("label" in options)     this.label = options.label;
      if ("area" in options)      this.area = options.area;
    },

    dataToPaper: function(c) {
      if (c instanceof Date) {
        c = mlp.dateToJulianDate(c);
      }

      if (this.scaleType == mlp.ScaleType.LOG) {
        c = Math.log(c)/Math.log(this.logBase);
      }

      return c;
    },

    paperToData: function(c) {
      if (c instanceof Date) {
        c = mlp.dateToJulianDate(c);
      }

      if (this.scaleType == mlp.ScaleType.LOG) {
        c = Math.pow(this.logBase, c);
      }

      return c;
    },

    ticks: function(area, count) {
      let bounds = area.bounds();

      let scale = (this.scaleType == mlp.ScaleType.TIME) ? d3.scaleTime() : (this.scaleType == mlp.ScaleType.LOG) ? d3.scaleLog() : d3.scaleLinear();
      if (this.scaleType == mlp.ScaleType.LOG) {
        scale.base(this.logBase);
      }

      let domain;
      let range;
      if (this.direction == mlp.AxisDirection.HORIZONTAL) {
        domain = [area.cameraBounds.x0, area.cameraBounds.x1];
        range = [bounds.x0, bounds.x1];
      } else {
        domain = [area.cameraBounds.y0, area.cameraBounds.y1];
        range = [bounds.y1, bounds.y0];
      }

      if (this.scaleType == mlp.ScaleType.LOG) {
        domain[0] = Math.pow(this.logBase, domain[0]);
        domain[1] = Math.pow(this.logBase, domain[1]);
      } else if (this.scaleType == mlp.ScaleType.TIME) {
        domain[0] = mlp.julianDateToDate(domain[0]);
        domain[1] = mlp.julianDateToDate(domain[1]);
      }

      scale.domain(domain);
      scale.range(range);

      let tickFormat = (this.scaleType == mlp.ScaleType.TIME) ? scale.tickFormat() : scale.tickFormat(5, "-e");

      let dataCoordsTicks = scale.ticks(count);
      let ticks = dataCoordsTicks.map(scale);
      let labels = dataCoordsTicks.map(tickFormat);

      // Remove the labels that are too closed
      let lastBounds = null;
      for (let i = 0; i < labels.length; i++) {
        let tick = ticks[i];
        let label = labels[i];

        if (label == "") {
          continue;
        }

        let bounds = mlp.getTextBounds(area.context, label);
        bounds.x0 -= 20;
        bounds.x1 += 20;
        bounds.y0 -= 20;
        bounds.y1 += 20;

        if (this.direction == mlp.AxisDirection.HORIZONTAL) {
          bounds.x0 += tick;
          bounds.x1 += tick;
        } else {
          bounds.y0 += tick;
          bounds.y1 += tick;
        }

        if (lastBounds == null) {
          lastBounds = bounds;
          continue;
        }

        // Do the bounds intersect?
        if ((bounds.x0 <= lastBounds.x1 && bounds.x1 >= lastBounds.x0) && (bounds.y0 <= lastBounds.y1 && bounds.y1 >= lastBounds.y0)) {
          // Yep. Delete the label.
          labels[i] = "";
        } else {
          // Nope. Keep it and reserve its space.
          lastBounds = bounds;
        }
      }

      return {ticks, labels};
    },
  });

  mlp.Plotter = mlp.createClass(mlp.Observable, {
    canvas: undefined,

    tooltip: undefined,
    objectTooltip: undefined,
    objectTooltipped: undefined,
    objectTooltipCursor: 'auto',
    tooltipPinned: false,
    objectTooltipBuilder: function(tooltipNode, pointer) {},

    mainArea:  undefined,
    xAxisArea: undefined,
    yAxisArea: undefined,
    areas: [],

    xAxis: undefined,
    yAxis: undefined,

    xAxisLabel: undefined,
    yAxisLabel: undefined,

    objects: undefined, // Area to object array
    hoveredObject: null,
    legendNameToItem: undefined,

    controls: undefined,
    options: undefined,
    nodes: undefined,

    // Allowed systems: mlp.CoordSystem.DATA and mlp.CoordSystem.PAPER
    inputCoords: mlp.CoordSystem.DATA,

    initialize: function(container, options) {
      if (typeof container == 'string') {
        let selector = container;
        container = document.querySelector(selector);
      }

      let textRenderer = new mlp.TextRenderer();

      this.objects = new Map();
      this.controls = [];
      this.options = [];
      this.nodes = {};
      this.legendNameToItem = {};

      this.objectTooltip = mlp.html("<div class='mlp-tooltip'></div>");
      document.body.appendChild(this.objectTooltip);

      let rect = mlp.rect;

      let self = this;

      let x = d3.scaleLinear();
      let y = d3.scaleLinear();

      let axisMarginLeft = 76;
      let axisMarginBottom = 45;

      //// UI (optional)

      let innerContainer = mlp.html(`
        <div class="plotter-container">
          <div class="left-panel">
            <div class="graph"><canvas></canvas></div>
            <div class="legend"></div>
            <div class="dateSliderContainer"></div>
          </div>
          <div class="options right-panel"><div class="optionsHeader">Options</div></div>
        </div>
      `);

      container.appendChild(innerContainer);
      this.canvas = new mlp.Canvas(innerContainer.querySelector(".graph canvas"));

      this.nodes = {
        container:  container,
        graph:      container.querySelector(".graph"),
        legend:     container.querySelector(".legend"),
        options:    container.querySelector(".options"),
        dateSlider: container.querySelector(".dateSliderContainer"),
      }

      //// Main area

      let plotter = this;

      this.mainArea = this.canvas.addArea({
        bounds: (canvasBounds) => {
          return {
            x0: axisMarginLeft,
            y0: 0,
            x1: canvasBounds.x1,
            y1: canvasBounds.y1 - axisMarginBottom,
          };
        },
      });

      this.objects.set(this.mainArea, []);
      this.areas.push(this.mainArea);

      let mainRenderer = function(context) {
        let area = plotter.mainArea;

        let bounds = area.bounds();
        let areaBounds = area.bounds();
        let cameraBounds = area.cameraBounds;

        context.beginPath();
        context.strokeStyle = "black";
        context.rect(bounds.x, bounds.y, bounds.w, bounds.h);
        context.stroke();

        context.beginPath();
        context.fillStyle = "white";
        context.rect(bounds.x, bounds.y, bounds.w, bounds.h);
        context.fill();

        let xTicks = plotter.xAxis.ticks(plotter.xAxisArea, 20);
        let yTicks = plotter.yAxis.ticks(plotter.yAxisArea, 10);

        context.strokeStyle = "#ccc";

        for (let tick of xTicks.ticks) {
          context.beginPath();
          context.moveTo(Math.floor(tick) - 0.5, bounds.y0);
          context.lineTo(Math.floor(tick) - 0.5, bounds.y1);
          context.stroke();
        }

        context.lineWidth = 1;

        for (let tick of yTicks.ticks) {
          context.beginPath();
          context.moveTo(bounds.x0, Math.floor(tick) - 0.5);
          context.lineTo(bounds.x1, Math.floor(tick) - 0.5);
          context.stroke();
        }

        for (let object of plotter.objects.get(area)) {
          if (object.visible) object.render(context);
        }

        context.lineWidth = 1;
        context.beginPath();
        context.strokeStyle = "#ccc";
        context.rect(bounds.x, bounds.y, bounds.w, bounds.h);
        context.stroke();
      };

      this.mainArea.render = function() {
        mainRenderer(this.context, this, this.bounds(), this.cameraBounds);
      };

      this.mainArea.onCameraChange = function() {
        plotter.xAxisArea.cameraBounds.setX(plotter.mainArea.cameraBounds.x);
        plotter.xAxisArea.cameraBounds.setW(plotter.mainArea.cameraBounds.w);

        plotter.yAxisArea.cameraBounds.setY(plotter.mainArea.cameraBounds.y);
        plotter.yAxisArea.cameraBounds.setH(plotter.mainArea.cameraBounds.h);
      }

      this.canvas.on('beforeRender', args => {
        args.context.fillStyle = "white";
        args.context.rect(0, 0, this.canvas.node.width, this.canvas.node.height);
        args.context.fill();
        this.fire('beforeRender');
      });

      this.canvas.on('afterRender', args => {
        let canvasBounds = rect({x: 700, y: 400, w: 200, h: 100});

        let minX = Infinity;
        let maxX = -Infinity;
        let minY = Infinity;
        let maxY = -Infinity;

        for (let object of plotter.objects.get(this.mainArea)) {
          if (object instanceof mlp.Point) {
            let x = object.paperCoords.x;
            let y = object.paperCoords.y;

            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }

        let cameraBounds = rect({x0: minX - 2, y0: minY/1.2, x1: maxX + 2, y1: maxY*1.2});
      });

      let rebuildTooltip = (hoveredObject, args) => {
        // Gee

        let objectTooltippedGroup = this.objectTooltipped ? (this.objectTooltipped.group ? this.objectTooltipped.group : this.objectTooltipped) : null;
        let hoveredObjectGroup = hoveredObject.group ? hoveredObject.group : hoveredObject;

        if (hoveredObjectGroup != objectTooltippedGroup) {
          this.tooltipPinned = false;

          this.tooltip = this.objectTooltipBuilder(hoveredObject, args.p);
          this.objectTooltip.innerHTML = '';
        }

        if (!this.tooltip) {
          return null;
        }

        this.objectTooltip.appendChild(this.tooltip.dom);
        this.objectTooltipped = hoveredObject;

        if (!this.tooltipPinned) {
          let offsetX = 10;
          let offsetY = 10;

          this.objectTooltip.style.visibility = 'visible';

          this.objectTooltip.style.left = 0;
          this.objectTooltip.style.top = 0;

          let rect = this.objectTooltip.getBoundingClientRect();
          let w = rect.width;
          let h = rect.height;

          let margin = 20;

          let x = args.e.clientX + offsetX;
          let y = args.e.clientY + offsetY;

          if (x + w + margin >= window.innerWidth) {
            x = args.e.clientX - offsetX - w;
          }

          if (y + h + margin >= window.innerHeight) {
            y = args.e.clientY - offsetY - h;
          }

          if (x < 0) x = 0;
          if (y < 0) y = 0;

          this.objectTooltip.style.left = x + 'px';
          this.objectTooltip.style.top = y + 'px';
        }

        return this.tooltip;
      };

      this.canvas.on('click', args => {
        let hoveredObject = this.getObjectUnderPoint(args.p);

        // If clicked outside
        if (!(this.objectTooltip && (this.objectTooltip == args.e.target || this.objectTooltip.contains(args.e.target)))) {
          this.tooltipPinned = false;
          this.objectTooltipped = null;
          this.objectTooltip.style.visibility = 'hidden';

          if (hoveredObject) {
            let tooltip = rebuildTooltip(hoveredObject, args);
            this.tooltipPinned = tooltip ? true : false;
            this.objectTooltip.style.visibility = tooltip ? 'visible' : 'hidden';
          }

          this.fire('click', {...args, object: hoveredObject});
        }
      });

      this.canvas.on('hoverStop', args => {
        if (!this.tooltipPinned) {
          this.objectTooltip.style.visibility = 'hidden';
        }
        this.canvas.node.style.cursor = 'auto';
      });

      this.canvas.on('hover', args => {
        if (args.state != mlp.STATE_IDLE) {
          this.objectTooltip.style.visibility = 'hidden';
          this.canvas.node.style.cursor = 'auto';
          return;
        }

        let subArgs = {...args};

        let hoveredObject = this.getObjectUnderPoint(args.p);
        let hoveredObjectChanged = false;

        if (this.hoveredObject != hoveredObject) {
          subArgs.mouseLeaveObject = this.hoveredObject;
          subArgs.mouseEnterObject = hoveredObject;
          this.hoveredObject = hoveredObject;
          hoveredObjectChanged = true;
        }

        if (!hoveredObject && !this.tooltipPinned) {
          this.objectTooltip.style.visibility = 'hidden';
        }

        this.canvas.node.style.cursor = hoveredObject ? hoveredObject.cursor : 'auto';

        this.fire('hover', subArgs);
        args.stopPropagation = subArgs.stopPropagation;

        if (!this.tooltipPinned) {
          if (!args.stopPropagation) {
            if (args.area != this.mainArea) return;

            if (hoveredObject) {
              rebuildTooltip(hoveredObject, args);
            }

            this.objectTooltip.style.visibility = ((hoveredObject && this.objectTooltip.innerHTML) || this.tooltipPinned) ? 'visible' : 'hidden';
          }
        }
      });

      //// Axes

      this.yAxisArea = this.canvas.addArea({
        lockCameraX: true,
        bounds: (canvasBounds) => {
          return {
            x0: 0,
            y0: 0,
            x1: axisMarginLeft,
            y1: canvasBounds.h - axisMarginBottom,
          };
        },
      });

      this.yAxisArea.onCameraChange = function() {
        plotter.mainArea.cameraBounds.setY(plotter.yAxisArea.cameraBounds.y);
        plotter.mainArea.cameraBounds.setH(plotter.yAxisArea.cameraBounds.h);
      };

      this.objects.set(this.yAxisArea, []);
      this.areas.push(this.yAxisArea);

      this.xAxisArea = this.canvas.addArea({
        lockCameraY: true,
        bounds: (canvasBounds) => {
          return {
            x0: axisMarginLeft,
            y0: canvasBounds.y1 - axisMarginBottom, 
            x1: canvasBounds.x1,
            y1: canvasBounds.y1,
          };
        },
      });

      this.xAxisArea.onCameraChange = function() {
        plotter.mainArea.cameraBounds.setX(plotter.xAxisArea.cameraBounds.x);
        plotter.mainArea.cameraBounds.setW(plotter.xAxisArea.cameraBounds.w);
      };

      this.objects.set(this.xAxisArea, []);
      this.areas.push(this.xAxisArea);

      this.xAxis = new mlp.Axis({area: this.xAxisArea, scaleType: mlp.ScaleType.LINEAR, direction: mlp.AxisDirection.HORIZONTAL});
      this.yAxis = new mlp.Axis({area: this.yAxisArea, scaleType: mlp.ScaleType.LOG, direction: mlp.AxisDirection.VERTICAL});

      let axisFontSize = 21;

      this.yAxisLabel = this.addText("y", {
        rotation: 90,
        area: this.yAxisArea,
        fontSize: axisFontSize,
        fill: "#333",
        fontWeight: "bold",
        normalizedBasePoint: {x: 0.5, y: 1.0},
      });

      this.canvas.on("beforeRender", args => {
        let text = plotter.yAxisLabel;

        let labelBounds = text.area.bounds().clone();

        // Fix this!
        text.area.context.save();
        text.area.context.font = (text.fontWeight || 'bold') + ' ' + (text.fontSize || 14) + 'px ' + (text.fontFamily || 'sans');
        let textBounds = mlp.rect(mlp.getTextBounds(text.area.context, text.text));
        text.area.context.restore();

        labelBounds.setW(labelBounds.w - 67);

        let cx = 0.5*(labelBounds.x0 + labelBounds.x1);
        let cy = 0.5*(labelBounds.y0 + labelBounds.y1);

        plotter.yAxisLabel.position = plotter.yAxisArea.canvasToPaper({x: cx, y: cy});
      });

      this.xAxisLabel = this.addText("x", {
        area: this.xAxisArea,
        fontSize: axisFontSize,
        fill: "#333",
        fontWeight: "bold",
        normalizedBasePoint: {x: 0.5, y: 0.5},
      });

      this.canvas.on("beforeRender", args => {
        let text = plotter.xAxisLabel;

        let labelBounds = text.area.bounds().clone();

        // Fix this!
        text.area.context.save();
        text.area.context.font = (text.fontWeight || 'bold') + ' ' + (text.fontSize || 14) + 'px ' + (text.fontFamily || 'sans');
        let textBounds = mlp.rect(mlp.getTextBounds(text.area.context, text.text));
        text.area.context.restore();

        labelBounds.setY(labelBounds.y + 10);
        labelBounds.setH(labelBounds.h - 5);

        let cx = 0.5*(labelBounds.x0 + labelBounds.x1);
        let cy = 0.5*(labelBounds.y0 + labelBounds.y1);

        plotter.xAxisLabel.position = plotter.xAxisArea.canvasToPaper({x: cx, y: cy});
      });

      let axisRender = function(axis) {
        return function() {
          let bounds = this.bounds();
          let mainBounds = plotter.mainArea.bounds();

          this.context.beginPath();
          this.context.fillStyle = "white";
          this.context.rect(bounds.x, bounds.y, bounds.w, bounds.h);
          this.context.fill();

          let isXAxis = (axis == self.xAxis);
          let scale = isXAxis ? x : y;

          this.context.font = '15px sans-serif';

          let ticks = isXAxis ? plotter.xAxis.ticks(plotter.xAxisArea, 20) : plotter.yAxis.ticks(plotter.yAxisArea, 10);

          for (let i = 0; i < ticks.ticks.length; i++) {
            let tick = ticks.ticks[i];

            this.context.beginPath();
            this.context.fillStyle = "#777"; // for the labels
            this.context.strokeStyle = "#999"; // for the ticks

            let canvasTxtState = {...canvasTxt};

            if (isXAxis) {
              let tickX = Math.floor(tick) - 0.5;

              this.context.moveTo(tickX, bounds.y0);
              this.context.lineTo(tickX, bounds.y0 + 4);

              textRenderer.hAlign = 'center';
              textRenderer.vAlign = 'top';
              textRenderer.drawText(this.context, ticks.labels[i], tickX, bounds.y0 + 3);
            } else {
              let tickY = Math.floor(tick) - 0.5;

              this.context.moveTo(bounds.x1 - 4, tickY);
              this.context.lineTo(bounds.x1, tickY);

              textRenderer.hAlign = 'right';
              textRenderer.vAlign = 'middle';
              textRenderer.drawText(this.context, ticks.labels[i], bounds.x1 - 3, tickY);
            }
            this.context.stroke();
          }

          this.context.lineWidth = 2;

          this.context.beginPath();
          this.context.strokeStyle = "black";
          if (isXAxis) {
            this.context.moveTo(bounds.x0, bounds.y0);
            this.context.lineTo(bounds.x1, bounds.y0);
          } else {
            this.context.moveTo(bounds.x1, bounds.y0);
            this.context.lineTo(bounds.x1, bounds.y1);
          }
          this.context.stroke();

          for (let object of plotter.objects.get(axis.area)) {
            if (object.visible) object.render(this.context);
          }
        }

        return renderer;
      };

      this.xAxisArea.render = axisRender(this.xAxis);
      this.yAxisArea.render = axisRender(this.yAxis);
      this.canvas.requestRenderAll();

      //
      // Options buttons
      //

      function openOptions(instantenous) {
        resizeOptions(340, instantenous);
      }

      function closeOptions(instantenous) {
        resizeOptions(0, instantenous);
      }

      let openOptionsButton = mlp.html('<div class="openOptions over-button">☰</div>');
      openOptionsButton.addEventListener("click", () => openOptions());
      this.nodes.graph.appendChild(openOptionsButton);

      let closeOptionsButton = mlp.html('<button class="closeOptions">&times;</button>');
      closeOptionsButton.addEventListener("click", () => closeOptions());
      this.nodes.options.querySelector(".optionsHeader").appendChild(closeOptionsButton);

      function resizeOptions(targetWidth, instantenous) {
        let optionsNode = self.nodes.options;
        optionsNode.style.height = (container.offsetHeight - 10) + 'px';
        closeOptionsButton.style.right = 0;

        let computedStyle = getComputedStyle(optionsNode);

        if (instantenous) {
          optionsNode.style.width = targetWidth + 'px';
        } else {
          mlp.lerp(0.1, parseFloat(computedStyle.width), targetWidth, (w) => {
            optionsNode.style.width = w + 'px';
          });
        }
      }
    },

    addControl: function(control) {
      let self = this;
      this.nodes.options.appendChild(control.node);
      this.controls.push(control);
      this.options[control.param] = control.getValue();
      control.on('change', e => self.onControlChanged(e, control));
    },

    addHtmlControls: function(html) {
      // Hacky :(
      let self = this;
      let node = mlp.html(`
        <div class="option">
          ${html}
        </div>
      `);
      for (let controlInput of node.querySelectorAll("input.control")) {
        controlInput.classList.add('optionValue');
        if (controlInput.type == "number") {
          let control = mlp.NumberControl({param: controlInput.id, input: controlInput});
          this.controls.push(control);
          this.options[control.param] = control.getValue();
          control.on('change', e => self.onControlChanged(e, control));
        }
      }
      console.log(node);
      this.nodes.options.appendChild(node);
    },

    onControlChanged: function(e, controlUpdated) {
      for (let control of this.controls) {
        this.options[control.param] = control.getValue();
      }
      this.fire('optionsChanged', {options: this.options, objectsUpdated: [controlUpdated]});
    },

    addMultiDateSlider: function(optionNames, handles, edges, range) {
      let self = this;

      self.multiSliderOptionNames = optionNames;

      self.multislider = new DateMultislider({
        parent: self.nodes.dateSlider,
        min: range[0],
        max: range[1],
        handles: handles,
        edges: edges,
      });

      self.multislider.on("change", () => {
        let values = self.multislider.getValues();

        for (let i = 0; i < optionNames.length; i++) {
          let optionName = optionNames[i];
          self.options[optionName] = values[i];
        }

        this.fire('optionsChanged', {options: this.options, objectsUpdated: optionNames});
      });

      for (let i = 0; i < optionNames.length; i++) {
        self.options[optionNames[i]] = handles[i].value;
      }
    },

    setOptions: function(params) {
      let paramsSet = [];
      for (let param in params) {
        this.options[param] = params[param];
        paramsSet.push(param);
      }

      for (let control of this.controls) {
        if (control.param in params) {
          control.setValue(params[control.param]);
        }
      }

      let multisliderValues = [];
      for (let param of this.multiSliderOptionNames) {
        multisliderValues.push(this.options[param]);
      }
      this.multislider.setValues(multisliderValues);

      this.fire('optionsChanged', {options: this.options, objectsUpdated: paramsSet});
    },

    setLegend: function(categories) {
      let self = this;

      for (let category of categories) {
        let svg;

        let shape = category.shape;

        let shapeToPath = {
          //"#triangle": "M 0.000000 -0.658037 L 0.759836 0.658037 L -0.759836 0.658037 z",
          //"#triangle-up": "M 0.000000 -0.658037 L 0.759836 0.658037 L -0.759836 0.658037 z",
          //"#triangle-down": "M 0.000000 0.658037 L 0.759836 -0.658037 L -0.759836 -0.658037 z",
          //"#triangle-left": "M -0.759836 0 L 0.759836 0.658037 L 0.759836 -0.658037 z",

          "#triangle":      "M 0 -1 L 1 1 L -1 1 z",
          "#triangle-up":   "M 0 -1 L 1 1 L -1 1 z",
          "#triangle-down": "M 0 1 L 1 -1 L -1 -1 z",
          "#triangle-left": "M -1 0 L 1 1 L 1 -1 z",
          "#square":        "M -1,-1 1,-1 1,1 -1,1 z",
          "#cross":         "M -1.000000 -0.400000 L -0.400000 -0.400000 L -0.400000 -1.000000 L 0.400000 -1.000000 L 0.400000 -0.400000 L 1.000000 -0.400000 L 1.000000 0.400000 L 0.400000 0.400000 L 0.400000 1.000000 L -0.400000 1.000000 L -0.400000 0.400000 L -1.000000 0.400000 z",
          "#diamond":       "M 0 1 L 1 0 L 0 -1 L -1 0 z",
          "#circle":        "M 0,0 m -1,0 a 1,1 0 1,0 2,0 a 1,1 0 1,0 -2,0",
        };

        if (shape in shapeToPath) shape = shapeToPath[shape];

        if (shape.charAt(0) == '#') {
          svg = '<svg class="icon" fill="none" stroke="'+ category.color +'" stroke-width="0.2"><use href="' + shape + '" /></svg>';
        } else {
          svg = '<svg class="icon" fill="none" stroke="'+ category.color +'" stroke-width="0.2" viewBox="-1 -1 2 2"><path d="'+ shape +'" transform="scale(0.9)"/></svg>';
        }

        let legendItem = mlp.html('<div data-value="'+ category.name +'" class="legendItem" style="color:' + category.color + '">' + svg + category.name + '</div>');

        self.legendNameToItem[category.name] = legendItem;

        legendItem.addEventListener("click", () => {
          self.fire('legendItemClick', {legendItem});
        });

        self.nodes.legend.appendChild(legendItem);
      }
    },

    getLegendItem: function(name) {
      return this.legendNameToItem[name];
    },

    getLegendItems: function() {
      return this.nodes.legend.querySelectorAll(".legendItem");
    },

    showLegend: function(showIt) {
      if (showIt) this.nodes.legend.classList.remove("hidden");
      else        this.nodes.legend.classList.add("hidden");
    },

    getObjectUnderPoint: function(canvasPoint, objects) {
      for (let area of this.areas) {
        let objects = this.objects.get(area);
        for (let i = objects.length - 1; i >= 0; i--) {
          let object = objects[i];

          if (!object.visible) continue;
          if (!object.interactive) continue;

          if (object.canvasDistanceToPoint(canvasPoint) < 8) {
              return object;
          }
        }
      }

      return null;
    },

    paperToCanvas: function(p, area) {
      area ||= this.mainArea;

      let q = area.paperToCanvas(p);

      return q;
    },

    dataToCanvas: function(q, area) {
      area ||= this.mainArea;

      let x = this.xAxis.dataToPaper(q.x);
      let y = this.yAxis.dataToPaper(q.y);

      let p = area.paperToCanvas(mlp.rect({x, y}));

      return p;
    },

    dataToCanvasRect: function(area, q) {
      let x0 = this.xAxis.dataToPaper(q.x0);
      let x1 = this.xAxis.dataToPaper(q.x1);
      let y0 = this.yAxis.dataToPaper(q.y0);
      let y1 = this.yAxis.dataToPaper(q.y1);

      let p0 = area.paperToCanvas(mlp.rect({x: x0, y: y0}));
      let p1 = area.paperToCanvas(mlp.rect({x: x1, y: y1}));
      let p = mlp.rect({x0: p0.x, y0: p0.y, x1: p1.x, y1: p1.y});

      return p;
    },

    setObjectTooltip: function(objectTooltipBuilder) {
      this.objectTooltipBuilder = objectTooltipBuilder;
    },

    buildTooltipTable: function(definition) {
      let html = '<table class="mlp-tooltip-table">';
      for (let row of definition) {
        html += '<tr><td class="key">' + row.label + '</td><td class="value">' + (Number.isNaN(row.value) ? '--' : row.value) + '</td></tr>';
      }
      html += '</table>';
      return mlp.html(html);
    },

    setCamera: function(bounds) {
      let filteredBounds = {};
      for (let key in bounds) {
        filteredBounds[key] = (bounds[key] instanceof Date) ? mlp.dateToJulianDate(bounds[key]) : bounds[key];
      }

      filteredBounds = mlp.rect(filteredBounds);

      if (this.inputCoords == mlp.CoordSystem.DATA) {
        filteredBounds.x0 = this.xAxis.dataToPaper(filteredBounds.x0);
        filteredBounds.y0 = this.yAxis.dataToPaper(filteredBounds.y0);
        filteredBounds.x1 = this.xAxis.dataToPaper(filteredBounds.x1);
        filteredBounds.y1 = this.yAxis.dataToPaper(filteredBounds.y1);

        filteredBounds.x = filteredBounds.x0;
        filteredBounds.y = filteredBounds.y0;
        filteredBounds.w = filteredBounds.x1 - filteredBounds.x0;
        filteredBounds.h = filteredBounds.y1 - filteredBounds.y0;
      }

      if (!isNaN(filteredBounds.x)) {
        this.mainArea.cameraBounds.x0 = filteredBounds.x0;
        this.mainArea.cameraBounds.x1 = filteredBounds.x1;
        this.mainArea.cameraBounds.x = filteredBounds.x;
        this.mainArea.cameraBounds.w = filteredBounds.w;
      }

      if (!isNaN(filteredBounds.y)) {
        this.mainArea.cameraBounds.y0 = filteredBounds.y0;
        this.mainArea.cameraBounds.y1 = filteredBounds.y1;
        this.mainArea.cameraBounds.y = filteredBounds.y;
        this.mainArea.cameraBounds.h = filteredBounds.h;
      }

      this.mainArea.onCameraChange();
    },

    clear: function(area) {
      this.objects.set(area || this.mainArea, []);
    },

    addPoint: function(x, y, options) {
      options ||= {};

      let p = this.getPaperCoords(x, y);
      let q = this.getDataCoords(x, y);
      let point = new mlp.Point(p, q, {area: this.mainArea, plotter: this, ...options});
      this.objects.get(options.area || this.mainArea).push(point);
      return point;
    },

    addPolyline: function(points, options) {
      options ||= {};

      let ps = [];
      let qs = [];

      for (let p of points) ps.push(this.getPaperCoords(p.x, p.y));
      for (let q of points) qs.push(this.getDataCoords(q.x, q.y));

      let polyline = new mlp.Polyline(ps, qs, {area: this.mainArea, plotter: this, ...options});

      this.objects.get(options.area || this.mainArea).push(polyline);
      return polyline;
    },

    addText: function(text, options) {
      options ||= {};
      options = {...options};
      if ("position" in options) {
        options.position = this.getPaperCoords(options.position.x, options.position.y);
      }
      let textObject = new mlp.Text(text, {area: this.mainArea, plotter: this, ...options});
      this.objects.get(options.area || this.mainArea).push(textObject);
      return textObject;
    },

    getDataCoords: function(x, y) {
      let p = {x: x, y: y};
      let dataCoords = {x: x, y: y};

      if (this.inputCoords == mlp.CoordSystem.PAPER) {
        dataCoords.x = this.xAxis.paperToData(p.x);
        dataCoords.y = this.yAxis.paperToData(p.y);
      }

      return dataCoords;
    },

    getPaperCoords: function(x, y) {
      let p = {x: x, y: y};
      let paperCoords = {x: x, y: y};

      if (this.inputCoords == mlp.CoordSystem.DATA) {
        paperCoords.x = this.xAxis.dataToPaper(p.x);
        paperCoords.y = this.yAxis.dataToPaper(p.y);
      }

      return paperCoords;
    },

    setAxis: function(axis, axisLabel, axisName, options) {
      axis.set(options);
      axisLabel.text = options.label;
      this.recomputePaperCoords(axisName);

      if ('range' in options) {
        this.setCamera({x0: options.range[0], x1: options.range[1]});
      }

      this.canvas.requestRenderAll();
    },

    setXAxis: function(options) {
      this.setAxis(this.xAxis, this.xAxisLabel, 'x', options);
    },

    setYAxis: function(options) {
      this.setAxis(this.yAxis, this.yAxisLabel, 'y', options);
    },

    // TODO
    recomputePaperCoords: function(axes) {
      for (let area of this.areas) {
        if (axes.includes('x')) {
          for (let object of this.objects.get(area)) {
            if (object instanceof mlp.Point) {
              object.paperCoords.x = this.xAxis.dataToPaper(object.dataCoords.x);
            }
          }
        }

        if (axes.includes('y')) {
          for (let object of this.objects.get(area)) {
            if (object instanceof mlp.Point) {
              object.paperCoords.y = this.yAxis.dataToPaper(object.dataCoords.y);
            }
          }
        }
      }
    },

    requestRenderAll: function() {
      this.canvas.requestRenderAll();
    }
  });
})();
