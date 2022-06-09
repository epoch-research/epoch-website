(function () {
  'use strict';

  mlp.devicePixelRatio = window.devicePixelRatio || window.webkitDevicePixelRatio || window.mozDevicePixelRatio || 1;

  mlp.STATE_IDLE     = 0;
  mlp.STATE_DRAGGING = 1;
  mlp.STATE_ZOOMING  = 2;

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
        this._cachedBoundingRect = rect({x: 0, y: 0, w: this.node.clientWidth, h: this.node.clientHeight});

        this.node.width = mlp.devicePixelRatio * this.node.clientWidth;
        this.node.height = mlp.devicePixelRatio * this.node.clientHeight;

        this.fire('resize');
        this.render(); // Sorry, but using requestRenderAll makes things less smooth, here
        this.dirty = false;
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

      this.activeEvents = [];
      this.state = mlp.STATE_IDLE;

      this.node.addEventListener("pointerdown",   this.onPointerEvent.bind(this));
      this.node.addEventListener("pointerenter",  this.onPointerEvent.bind(this));
      document.addEventListener("pointerleave",  this.onPointerEvent.bind(this));
      document.addEventListener("pointerup",     this.onPointerEvent.bind(this));
      document.addEventListener("pointermove",   this.onPointerEvent.bind(this));
      document.addEventListener("pointercancel", this.onPointerEvent.bind(this));
      document.addEventListener("pointerout",    this.onPointerEvent.bind(this));

      // TODO do we really need eventjs?
      eventjs.add(this.node, "wheel", this.onWheel.bind(this), {passive: false});
    },

    getTouchedArea: function(p) {
      let activeArea = null;
      for (let area of this.areas) {
        if (area.bounds().contains({x: p.x, y: p.y})) {
          activeArea = area;
          break;
        }
      }

      return activeArea;
    },

    hoverAction: function(e, p) {
      this.fire('hover', {e, p: p, area: this.getTouchedArea(p), state: this.state});
      this.hoverActive = true;
    },

    stopHoverAction: function() {
      if (this.hoverActive) {
        this.fire('hoverStop');
        this.hoverActive = false;
      }
    },

    startOnePointerAction: function(e, p) {
      this.state = mlp.STATE_DRAGGING;
      this.activeArea = this.getTouchedArea(p);
      if (this.activeArea) this.cameraAnchor = rect(this.activeArea.cameraBounds);
      this.anchorP = p;
    },

    onePointerAction: function(e, p) {
      if (this.activeArea && this.anchorP) {
        let delta = mlp.diff(p, this.anchorP);

        let bounds = this.activeArea.bounds();

        if (!this.activeArea.lockCameraX) this.activeArea.cameraBounds.setX(this.cameraAnchor.x - delta.x * this.activeArea.cameraBounds.w/bounds.w);
        if (!this.activeArea.lockCameraY) this.activeArea.cameraBounds.setY(this.cameraAnchor.y + delta.y * this.activeArea.cameraBounds.h/bounds.h);

        this.activeArea.onCameraChange();
        this.requestRenderAll();
      }
    },

    stopOnePointerAction: function(e, p) {
      if (this.anchorP) {
        if (p.x == this.anchorP.x && p.y == this.anchorP.y) {
          this.fire('click', {e, p: p, area: this.activeArea});
        }

        this.activeArea = null;
        this.anchorP = null;
      }
      this.state = mlp.STATE_IDLE;
    },

    startTwoPointerAction: function(es, ps) {
      this.state = mlp.STATE_ZOOMING;
      if (!this.activeArea) this.activeArea = this.getTouchedArea(ps[0]);
      if (this.activeArea) this.cameraAnchor = rect(this.activeArea.cameraBounds);
      this.anchorP1 = ps[0];
      this.anchorP2 = ps[1];
    },

    twoPointerAction: function(es, ps) {
      if (this.activeArea && this.anchorP1 && this.anchorP2) {
        let dist = mlp.dist(ps[1], ps[0]);
        let anchorDist = mlp.dist(this.anchorP2, this.anchorP1);
        let zoom = anchorDist/dist;

        let anchorCenter = mlp.mul(mlp.add(this.anchorP2, this.anchorP1), 0.5);

        let camBounds = rect(this.cameraAnchor);
        this.activeArea.cameraBounds = camBounds;

        let p = this.activeArea.canvasToPaper(anchorCenter);

        if (!this.activeArea.lockCameraX) camBounds.setW(camBounds.w * zoom);
        if (!this.activeArea.lockCameraY) camBounds.setH(camBounds.h * zoom);

        let q = this.activeArea.canvasToPaper(anchorCenter);

        if (!this.activeArea.lockCameraX) camBounds.setX(camBounds.x - (q.x - p.x));
        if (!this.activeArea.lockCameraY) camBounds.setY(camBounds.y - (q.y - p.y));

        this.activeArea.onCameraChange();
        this.requestRenderAll();
      }
    },

    stopTwoPointerAction: function() {
      this.state = mlp.STATE_IDLE;
    },

    onPointerEvent: function(e) {
      let activeEvents = this.activeEvents;
      let prevActiveEvents = [...activeEvents];

      let pointerIndex = -1;
      let cachedPointer = null;
      for (let i = 0; i < activeEvents.length; i++) {
        if (activeEvents[i].pointerId == e.pointerId) {
          pointerIndex = i;
          cachedPointer = activeEvents[i];
          activeEvents[i] = e;
          break;
        }
      }

      let isDownEvent = (e.type == "pointerdown");
      let isMoveEvent = (e.type == "pointermove");
      let isUpEvent = (e.type == "pointerup" || e.type == "pointercancel");
      let isOutEvent = (e.type == "pointerleave" || e.type == "pointerout");

      if (isDownEvent) {
        if (pointerIndex < 0 && activeEvents.length < 2) {
          activeEvents.push(e);
          pointerIndex = activeEvents.length - 1;
          cachedPointer = e;
        }
      } else if (isUpEvent) {
        if (pointerIndex >= 0) {
          activeEvents.splice(pointerIndex, 1);
          pointerIndex = -1;
        }
      }

      let prevActivePointerCount = prevActiveEvents.length;
      let activePointerCount = activeEvents.length;

      let activePoints = [];
      let rect = this.node.getBoundingClientRect();
      for (let e of activeEvents) {
        activePoints.push({x: e.clientX - rect.left, y: e.clientY - rect.top});
      }

      let currentPoint = {x: e.clientX - rect.left, y: e.clientY - rect.top};

      if (prevActivePointerCount != activePointerCount) {
        if (prevActivePointerCount == 1) this.stopOnePointerAction(e, currentPoint);
        if (prevActivePointerCount == 2) this.stopTwoPointerAction([activeEvents[0], e], [activePoints[0], currentPoint]);

        if (activePointerCount == 1) this.startOnePointerAction(activeEvents[0], activePoints[0]);
        if (activePointerCount == 2) this.startTwoPointerAction(activeEvents, activePoints)
        e.preventDefault();
      } else if (activePointerCount > 0) {
        if (activePointerCount == 1) this.onePointerAction(activeEvents[0], activePoints[0]);
        if (activePointerCount == 2) this.twoPointerAction(activeEvents, activePoints);
        e.preventDefault();
      }

      if ((e.target == this.node) && (isMoveEvent || activeEvents.length == 0)) {
        this.hoverAction(e, currentPoint);
      }

      if (isOutEvent) {
        this.stopHoverAction();
      }
    },

    onWheel: function(e, self) {
      let rect = this.node.getBoundingClientRect();
      let pointer = {x: e.clientX - rect.left, y: e.clientY - rect.top};

      let areaUnderPointer = this.getTouchedArea(pointer);

      if (areaUnderPointer) {
        let camBounds = areaUnderPointer.cameraBounds;
        let areaBounds = areaUnderPointer.bounds();

        let zoom = 2**(-self.wheelDelta/800);

        let p = areaUnderPointer.canvasToPaper(pointer);

        if (!areaUnderPointer.lockCameraX) camBounds.setW(camBounds.w * zoom);
        if (!areaUnderPointer.lockCameraY) camBounds.setH(camBounds.h * zoom);

        let q = areaUnderPointer.canvasToPaper(pointer);

        if (!areaUnderPointer.lockCameraX) camBounds.setX(camBounds.x - (q.x - p.x));
        if (!areaUnderPointer.lockCameraY) camBounds.setY(camBounds.y - (q.y - p.y));

        areaUnderPointer.onCameraChange();
        this.requestRenderAll();
      }

      e.preventDefault();
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
      this.fire('beforeRender', {context: this.context});
      for (let area of this.areas) {
        area._render();
      }
      this.fire('afterRender', {context: this.context});
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


