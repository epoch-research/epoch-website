//******************************************************************************
// Utils
//******************************************************************************

(function() {
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Class Creation
  // Taken from fabric.js (https://github.com/fabricjs/fabric.js/tree/master)
  // TODO Ensure they are properly credited
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  var slice = Array.prototype.slice, emptyFunction = function() { },

  IS_DONTENUM_BUGGY = (function() {
    for (var p in { toString: 1 }) {
      if (p === 'toString') {
        return false;
      }
    }
    return true;
  })(),

  /** @ignore */
  addMethods = function(klass, source, parent) {
    for (var property in source) {

      if (property in klass.prototype &&
          typeof klass.prototype[property] === 'function' &&
          (source[property] + '').indexOf('callSuper') > -1) {

        klass.prototype[property] = (function(property) {
          return function() {

            var superclass = this.constructor.superclass;
            this.constructor.superclass = parent;
            var returnValue = source[property].apply(this, arguments);
            this.constructor.superclass = superclass;

            if (property !== 'initialize') {
              return returnValue;
            }
          };
        })(property);
      }
      else {
        klass.prototype[property] = source[property];
      }

      if (IS_DONTENUM_BUGGY) {
        if (source.toString !== Object.prototype.toString) {
          klass.prototype.toString = source.toString;
        }
        if (source.valueOf !== Object.prototype.valueOf) {
          klass.prototype.valueOf = source.valueOf;
        }
      }
    }
  };

  function Subclass() { }

  function callSuper(methodName) {
    var parentMethod = null,
        _this = this;

    // climb prototype chain to find method not equal to callee's method
    while (_this.constructor.superclass) {
      var superClassMethod = _this.constructor.superclass.prototype[methodName];
      if (_this[methodName] !== superClassMethod) {
        parentMethod = superClassMethod;
        break;
      }
      // eslint-disable-next-line
      _this = _this.constructor.superclass.prototype;
    }

    if (!parentMethod) {
      return console.log('tried to callSuper ' + methodName + ', method not found in prototype chain', this);
    }

    return (arguments.length > 1)
      ? parentMethod.apply(this, slice.call(arguments, 1))
      : parentMethod.call(this);
  }

  function createClass() {
    var parent = null,
        properties = slice.call(arguments, 0);

    if (typeof properties[0] === 'function') {
      parent = properties.shift();
    }
    function klass() {
      this.initialize.apply(this, arguments);
    }

    klass.superclass = parent;
    klass.subclasses = [];

    if (parent) {
      Subclass.prototype = parent.prototype;
      klass.prototype = new Subclass();
      parent.subclasses.push(klass);
    }
    for (var i = 0, length = properties.length; i < length; i++) {
      addMethods(klass, properties[i], parent);
    }
    if (!klass.prototype.initialize) {
      klass.prototype.initialize = emptyFunction;
    }
    klass.prototype.constructor = klass;
    klass.prototype.callSuper = callSuper;
    return klass;
  }

  mlp.createClass = createClass;

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Time and date
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  mlp.date = function(year, month, day) {
    return new Date(year, month - 1, day);
  }

  mlp.dateToJulianDate = function(date) {
    let month = date.getMonth() + 1;
    var x = Math.floor((14 - month)/12);
    var y = date.getFullYear() + 4800 - x;
    var z = month - 3 + 12 * x;

    var n = date.getDate() + Math.floor(((153 * z) + 2)/5) + (365 * y) + Math.floor(y/4) + Math.floor(y/400) - Math.floor(y/100) - 32045;

    return n;
  }   

  mlp.julianDateToDate = function(julianDate) {
    // https://stackoverflow.com/a/26371251

    let epoch = 2440587.5; // 1970-01-01 00:00 (one would hope)
    let millis = (julianDate - 2440587.5) * 86400000;
    let date = new Date(millis);

    return date;
  }

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Events
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  mlp.Observable = mlp.createClass({
    on: function(events, callback) {
      if (!this.eventCallbacks) {
        this.eventCallbacks = {};
      }

      if (!this.firedEvents) {
        this.firedEvents = {};
      }

      if (typeof events == 'string') events = [events];

      for (let event of events) {
        if (!(event in this.eventCallbacks)) {
          this.eventCallbacks[event] = [];
        }
        this.eventCallbacks[event].push(callback);

        if (event in this.firedEvents) {
          callback(this.firedEvents[event]);
        }
      }
    },

    fire: function(events, args) {
      if (!this.eventCallbacks) {
        this.eventCallbacks = {};
      }

      if (!this.firedEvents) {
        this.firedEvents = {};
      }

      args ||= {};

      if (typeof events == 'string') events = [events];

      for (let event of events) {
        this.firedEvents[event] = args;

        if (!(event in this.eventCallbacks)) {
          continue;
        }

        for (let callback of this.eventCallbacks[event]) {
          callback(args);
          if (args.stopPropagation) {
            break;
          }
        }
      }
    },
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Text rendering
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  mlp.getTextBounds = function(context, text) {
    context.save();

    let textMetrics = context.measureText(text);

    context.restore();

    let bounds = {
      x0: -textMetrics.actualBoundingBoxLeft,
      x1: +textMetrics.actualBoundingBoxRight,
      y0: -textMetrics.actualBoundingBoxAscent,
      y1: +textMetrics.actualBoundingBoxDescent,

      fontY0: -textMetrics.fontBoundingBoxAscent,
      fontY1: +textMetrics.fontBoundingBoxDescent,
    };

    bounds.w = bounds.x1 - bounds.x0;
    bounds.h = bounds.y1 - bounds.y0;
    bounds.fontH = bounds.fontY1 - bounds.fontY0;

    return bounds;
  };

  mlp.getFontBounds = function(context) {
    context.save();

    context.textBaseline = 'alphabetic';

    let textMetrics = context.measureText(text);

    context.restore();

    let bounds = {
      x0: -textMetrics.actualBoundingBoxLeft,
      x1: +textMetrics.actualBoundingBoxRight,
      y0: -textMetrics.actualBoundingBoxAscent,
      y1: +textMetrics.actualBoundingBoxDescent,
    };

    bounds.w = bounds.x1 - bounds.x0;
    bounds.h = bounds.y1 - bounds.y0;

    return bounds;
  };

  mlp.TextRenderer = mlp.createClass({
    // The context of said canvas element
    context: undefined,

    hAlign: 'center',

    vAlign: 'middle',

    showDebugInfo: false,

    initialize: function() {
    },

    drawText: function(context, text, x, y, hAlign, vAlign) {
      hAlign ||= this.hAlign;
      vAlign ||= this.vAlign;

      context.textAlign = hAlign;
      context.textBaseline = vAlign;

      if (this.showDebugInfo) {
        context.beginPath();
        context.moveTo(x - 300, y);
        context.lineTo(x + 300, y);
        context.stroke();

        context.beginPath();
        context.moveTo(x, y - 10);
        context.lineTo(x, y + 10);
        context.stroke();
      }

      context.fillText(text, x, y);

      let bounds = mlp.getTextBounds(context, text);

      if (this.showDebugInfo) {
        context.strokeRect(x + bounds.x0, y + bounds.y0, bounds.x1 - bounds.x0, bounds.y1 - bounds.y0);
      }
    },
  });

  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  // Misc
  // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -

  mlp.Rect = mlp.createClass({
    x0: 0,
    y0: 0,
    x1: 0,
    y1: 0,

    x: 0,
    y: 0,
    w: 0,
    h: 0,

    initialize: function(options) {
      if ("x0" in options || "y0" in options) {
        this.x0 = options.x0;
        this.y0 = options.y0;
        this.x1 = options.x1;
        this.y1 = options.y1;

        this.x = options.x0;
        this.y = options.y0;
        this.w = options.x1 - options.x0;
        this.h = options.y1 - options.y0;
      } else {
        this.x = options.x;
        this.y = options.y;
        this.w = options.w;
        this.h = options.h;

        this.x0 = options.x;
        this.y0 = options.y;
        this.x1 = options.x + options.w;
        this.y1 = options.y + options.h;
      }
    },

    setX: function(newX) {
      this.x = newX;
      this.x0 = newX;
      this.x1 = newX + this.w;
    },

    setY: function(newY) {
      this.y = newY;
      this.y0 = newY;
      this.y1 = newY + this.h;
    },

    setW: function(newW) {
      this.w = newW;
      this.x1 = this.x0 + this.w;
    },

    setH: function(newH) {
      this.h = newH;
      this.y1 = this.y0 + this.h;
    },

    contains: function(p) {
      return (this.x0 <= p.x && p.x < this.x1) && (this.y0 <= p.y && p.y < this.y1);
    },

    clone: function() {
      return new mlp.Rect({x: this.x, y: this.y, w: this.w, h: this.h});
    }
  });

  mlp.rect = function(options) {
    return new mlp.Rect(options);
  };

  mlp.arrayContains = function(array, o) {
    for (let item of array) {
      if (item == o)
        return true;
    }

    return false;
  }

  let id = 0;

  mlp.makeId = function() {
    return id++;
  }

  mlp.norm = function(p) {
    return Math.sqrt(p.x**2 + p.y**2);
  }

  mlp.dist = function(p, q) {
    return Math.sqrt((q.x - p.x)*(q.x - p.x) + (q.y - p.y)*(q.y - p.y));
  }

  mlp.distSquare = function(p, q) {
    return (q.x - p.x)*(q.x - p.x) + (q.y - p.y)*(q.y - p.y);
  }

  mlp.distToLine = function(p, q0, q1) {
    let length = mlp.dist(q0, q1);

    let u = {x: (q1.x - q0.x)/length, y: (q1.y - q0.y)/length};
    let n = {x: -u.y, y: u.x};

    let a = (p.x - q0.x) * u.x + (p.y - q0.y) * u.y;
    let b = (p.x - q0.x) * n.x + (p.y - q0.y) * n.y;

    return (a < 0) ? mlp.dist(q0, p) : (a > length) ? mlp.dist(q1, p) : Math.abs(b);
  }

  mlp.pointIsInPolygon = function(p, vs, start, end) {
    // Taken from https://github.com/substack/point-in-polygon/blob/master/nested.js
    var x = p.x, y = p.y;
    var inside = false;
    if (start === undefined) start = 0;
    if (end === undefined) end = vs.length;
    var len = end - start;
    for (var i = 0, j = len - 1; i < len; j = i++) {
        var xi = vs[i+start].x, yi = vs[i+start].y;
        var xj = vs[j+start].x, yj = vs[j+start].y;
        var intersect = ((yi > y) !== (yj > y))
            && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
        if (intersect) inside = !inside;
    }
    return inside;
  }

  mlp.distToPolygon = function(p, qs) {
    if (mlp.pointIsInPolygon(p, qs)) {
      return 0;
    }

    let minDist = Infinity;

    if (qs.length > 2) {
      let lastQ = qs[0];
      for (let i = 1; i < (closed ? qs.length + 1 : qs.length); i++) {
        let q = qs[i % qs.length];
        minDist = Math.min(minDist, mlp.distToLine(p, lastQ, q));
        lastQ = q;
      }
    }

    return minDist;
  }

  mlp.distToPolyline = function(p, qs, closed) {
    let minDist = Infinity;

    if (qs.length >= 2) {
      let lastQ = qs[0];

      for (let i = 1; i < (closed ? qs.length + 1 : qs.length); i++) {
        let q = qs[i % qs.length];
        minDist = Math.min(minDist, mlp.distToLine(p, lastQ, q));
        lastQ = q;
      }
    }

    return minDist;
  }

  mlp.mul = function(p, a) {
    return {x: p.x * a, y: p.y * a};
  }

  mlp.add = function(p, q) {
    return {x: p.x + q.x, y: p.y + q.y};
  }

  mlp.diff = function(q, p) {
    return {x: q.x - p.x, y: q.y - p.y};
  }

  mlp.rotate = function(p, q, angle) {
    angle = -angle;

    let c = Math.cos(angle);
    let s = Math.sin(angle);

    let diffX = p.x - q.x;
    let diffY = p.y - q.y;

    let x = q.x + (c * diffX - s * diffY);
    let y = q.y + (s * diffX + c * diffY);

    return {x, y};
  }

  mlp.html = function(str) {
    let tmpDiv = document.createElement("div");
    tmpDiv.innerHTML = str;
    return tmpDiv.firstElementChild;
  }

  mlp.lerp = function(duration, from, to, callback) {
    if (duration == 0) {
      callback(to);
      return;
    }

    let t0 = new Date();
    let dt = 10e-3;

    function step() {
      let t = (new Date() - t0) * 1e-3;
      let s = Math.min(t/duration, 1);
      let v = (1 - s) * from + s * to;
      callback(v);
      if (t < duration) {
        setTimeout(step, 1000*Math.min((duration - t) + 1e-3, dt));
      }
    }

    step();
  }

  mlp.removeFromArray = function(array, value) {
    var idx = array.indexOf(value);
    if (idx !== -1) {
      array.splice(idx, 1);
    }
    return array;
  }

  mlp.addToArray = function(array, value) {
    if (value && !array.includes(value)) array.push(value);
    return array;
  }

  mlp.createEnum = (definition) => Object.freeze(definition);
})();
