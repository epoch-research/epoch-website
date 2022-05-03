(function () {
  'use strict';

  mlp.devicePixelRatio = window.devicePixelRatio || window.webkitDevicePixelRatio || window.mozDevicePixelRatio || 1;

  let rect = mlp.rect;

  mlp.Canvas = mlp.createClass(mlp.Observable, {
    // The canvas element
    node: undefined,

    // The context of said canvas element
    context: undefined,

    // Array of areas
    areas: [],

    // If dirty, redraw on next frame
    dirty: true,

    activeArea: null,

    // For dragging
    cameraAnchor: null,

    currentPointer: {x: 0, y: 0},

    _cachedBoundingRect: null,

    initialize: function(container, options) {
      if (typeof container == 'string') {
        let selector = container;
        container = document.querySelector(selector);
      }

      this.node = container;
      this.context = this.node.getContext("2d");

      let self = this;

      let onResize = () => {
        self._cachedBoundingRect = rect({x: 0, y: 0, w: this.node.clientWidth, h: this.node.clientHeight});

        self.node.width = mlp.devicePixelRatio * self.bounds().w;
        self.node.height = mlp.devicePixelRatio * self.bounds().h;

        this.fire('resize');
        self.render(); // Sorry, but using requestRenderAll makes things less smooth, here
        self.dirty = false;
      }

      let resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(this.node);
      onResize();

      let renderLoop = () => {
        if (self.dirty) {
          self.render();
          self.dirty = false;
        }
        requestAnimationFrame(renderLoop);
      };

      renderLoop();

      eventjs.add(this.node, "mousemove mouseover mouseout drag wheel click", this.onEvent.bind(this), {passive: false});
    },

    onEvent: function(e, self) {
      let areaHovered = null;

      if ('offsetX' in e && 'offsetY' in e) {
        let moved = (this.currentPointer.x != e.offsetX) || (this.currentPointer.y != e.offsetY);
        this.currentPointer = {x: e.offsetX, y: e.offsetY};

        for (let area of this.areas) {
          if (area.bounds().contains(this.currentPointer)) {
            areaHovered = area;
            break;
          }
        }

        if (moved) {
          this.fire('mousemove', {e, pointer: this.currentPointer, area: areaHovered});
          e.preventDefault();
        }
      }

      if (self && self.gesture == "click") {
        //console.log(e, self);
        //this.fire('click', {e, pointer: this.currentPointer, area: areaHovered});
        e.preventDefault();
      } else if (self && self.gesture == "drag") {
        if (self.state == "down") {
          this.activeArea = null;
          this.cameraAnchor = null;
          for (let area of this.areas) {
            if (area.bounds().contains({x: self.x, y: self.y})) {
              this.activeArea = area;
              this.cameraAnchor = rect(area.cameraBounds); // clone
              break;
            }
          }
        } else if (self.state == "move") {
          if (this.activeArea) {
            let delta = {
              x: self.x - self.start.x,
              y: self.y - self.start.y,
            };

            let bounds = this.activeArea.bounds();

            if (!this.activeArea.lockCameraX) this.activeArea.cameraBounds.setX(this.cameraAnchor.x - delta.x * this.activeArea.cameraBounds.w/bounds.w);
            if (!this.activeArea.lockCameraY) this.activeArea.cameraBounds.setY(this.cameraAnchor.y + delta.y * this.activeArea.cameraBounds.h/bounds.h);

            this.activeArea.onCameraChange();
            this.requestRenderAll();
          }
        } else if (self.state == "up") {
          if (self.x == self.start.x && self.y == self.start.y) {
            this.fire('click', {e, pointer: this.currentPointer, area: this.activeArea});
          }
          this.activeArea = null;
        }

        if (e.preventDefault) e.preventDefault();
      } else if (self && self.gesture == "wheel") {
        // TODO Take into account touch devices!

        let areaUnderPointer = null;
        for (let area of this.areas) {
          if (area.bounds().contains(this.currentPointer)) {
            areaUnderPointer = area;
            break;
          }
        }

        if (areaUnderPointer) {
          let camBounds = areaUnderPointer.cameraBounds;
          let areaBounds = areaUnderPointer.bounds();

          let zoom = 2**(-self.wheelDelta/800);

          let p = areaUnderPointer.canvasToPaper(this.currentPointer);

          if (!areaUnderPointer.lockCameraX) camBounds.setW(camBounds.w * zoom);
          if (!areaUnderPointer.lockCameraY) camBounds.setH(camBounds.h * zoom);

          let q = areaUnderPointer.canvasToPaper(this.currentPointer);

          if (!areaUnderPointer.lockCameraX) camBounds.setX(camBounds.x - (q.x - p.x));
          if (!areaUnderPointer.lockCameraY) camBounds.setY(camBounds.y - (q.y - p.y));

          areaUnderPointer.onCameraChange();
          this.requestRenderAll();
        }
        e.preventDefault();
      } else {
        this.fire(e.type, {e, pointer: this.currentPointer, area: this.activeArea});
        e.preventDefault();
      }
    },

    bounds: function() {
      return this._cachedBoundingRect;
    },

    addArea: function(options) {
      let area = new mlp.Area(this, options);
      this.areas.push(area);
      return area;
    },

    render: function() {
      this.context.save();
      this.context.scale(mlp.devicePixelRatio, mlp.devicePixelRatio);
      this.fire('beforeRender');
      for (let area of this.areas) {
        area._render();
      }
      this.fire('afterRender');
      this.context.restore();
    },

    requestRenderAll: function() {
      this.dirty = true;
    },
  });

  mlp.Area = mlp.createClass({
    // Parent canvas
    canvas: undefined,

    // Context of the parent canvas
    context: undefined,

    cameraBounds: undefined,

    id: null,

    lockCameraX: false,
    lockCameraY: false,

    initialize: function(canvas, options) {
      options ||= {};

      this.id = mlp.makeId();

      this.canvas = canvas;
      this.context = canvas.context;

      this.lockCameraX = ('lockCameraX' in options) ? options.lockCameraX : false;
      this.lockCameraY = ('lockCameraY' in options) ? options.lockCameraY : false;

      let bounds = options.bounds || (canvasBounds => {return {x: 0, y: 0, w: canvasBounds.w, h: canvasBounds.h}});

      this.bounds = function() {
        if (typeof(bounds) === 'function') {
          return rect(bounds(this.canvas.bounds()));
        } else {
          return rect(bounds);
        }
      };

      this.cameraBounds = rect({x: 0, y: 0, w: this.bounds().w, h: this.bounds().h});
    },

    // Convert paper coordinates to canvas coordinates
    paperToCanvas: function(p) {
      return mlp.Converter.paperToCanvas(p, this.bounds(), this.cameraBounds);
    },

    // Convert canvas coordinates to paper coordinates
    canvasToPaper: function(q) {
      return mlp.Converter.canvasToPaper(q, this.bounds(), this.cameraBounds);
    },

    onCameraChange: function() {
    },

    render: function() {
    },

    bounds: function() {
      // This one is set in the initializer
    },

    _render: function() {
      let bounds = this.bounds();

      this.context.save();

      this.context.beginPath();
      this.context.rect(bounds.x, bounds.y, bounds.w, bounds.h);
      this.context.clip();

      this.render();
      this.context.restore();
    },

    clippedContext: function() {
      this.context.beginPath();
      this.context.rect();
      this.context.clip();
      return this.context;
    }
  });

  mlp.Converter = {
    // Convert paper coordinates to canvas coordinates
    paperToCanvas: function(p, canvasBounds, cameraBounds) {
      p = {...p};

      if (typeof p.x === 'function') p.x = p.x(cameraBounds);
      if (typeof p.y === 'function') p.y = p.y(cameraBounds);

      let normalizedCoords = {
        x: (p.x - cameraBounds.x)/cameraBounds.w,
        y: (p.y - cameraBounds.y)/cameraBounds.h,
      };

      let q = {
        x: canvasBounds.x0 + canvasBounds.w * normalizedCoords.x,
        y: canvasBounds.y1 - canvasBounds.h * normalizedCoords.y,
      };

      return q;
    },

    // Convert canvas coordinates to paper coordinates
    canvasToPaper: function(q, canvasBounds, cameraBounds) {
      let normalizedCoords = {
        x: (q.x - canvasBounds.x0)/canvasBounds.w,
        y: (canvasBounds.y1 - q.y)/canvasBounds.h,
      };

      let p = {
        x: cameraBounds.x + normalizedCoords.x * cameraBounds.w,
        y: cameraBounds.y + normalizedCoords.y * cameraBounds.h,
      };

      return p;
    },
  };
})();


