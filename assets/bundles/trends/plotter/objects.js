(function () {
  let HalfSqrt3 = Math.sqrt(3)/2;
  let Tan30 = Math.tan(30 * Math.PI/180);

  // From Vega (https://github.com/vega/vega)
  // TODO Ensure they are properly credited
  mlp.pointSymbols = {
    'circle': {
      draw: function (context, size) {
        const r = Math.sqrt(size) / 2;
        context.moveTo(r, 0);
        context.arc(0, 0, r, 0, 2*Math.PI);
      }
    },
    'cross': {
      draw: function (context, size) {
        var r = Math.sqrt(size) / 2,
            s = r / 2.5;
        context.moveTo(-r, -s);
        context.lineTo(-r, s);
        context.lineTo(-s, s);
        context.lineTo(-s, r);
        context.lineTo(s, r);
        context.lineTo(s, s);
        context.lineTo(r, s);
        context.lineTo(r, -s);
        context.lineTo(s, -s);
        context.lineTo(s, -r);
        context.lineTo(-s, -r);
        context.lineTo(-s, -s);
        context.closePath();
      }
    },
    'diamond': {
      draw: function (context, size) {
        const r = Math.sqrt(size) / 2;
        context.moveTo(-r, 0);
        context.lineTo(0, -r);
        context.lineTo(r, 0);
        context.lineTo(0, r);
        context.closePath();
      }
    },
    'square': {
      draw: function (context, size) {
        var w = Math.sqrt(size),
            x = -w / 2;
        context.rect(x, x, w, w);
      }
    },
    'arrow': {
      draw: function (context, size) {
        var r = Math.sqrt(size) / 2,
            s = r / 7,
            t = r / 2.5,
            v = r / 8;
        context.moveTo(-s, r);
        context.lineTo(s, r);
        context.lineTo(s, -v);
        context.lineTo(t, -v);
        context.lineTo(0, -r);
        context.lineTo(-t, -v);
        context.lineTo(-s, -v);
        context.closePath();
      }
    },
    'wedge': {
      draw: function (context, size) {
        var r = Math.sqrt(size) / 2,
            h = HalfSqrt3 * r,
            o = h - r * Tan30,
            b = r / 4;
        context.moveTo(0, -h - o);
        context.lineTo(-b, h - o);
        context.lineTo(b, h - o);
        context.closePath();
      }
    },
    'triangle': {
      draw: function (context, size) {
        var r = Math.sqrt(size) / 2,
            h = HalfSqrt3 * r,
            o = h - r * Tan30;
        context.moveTo(0, -h - o);
        context.lineTo(-r, h - o);
        context.lineTo(r, h - o);
        context.closePath();
      }
    },
    'triangle-up': {
      draw: function (context, size) {
        var r = Math.sqrt(size) / 2,
            h = HalfSqrt3 * r;
        context.moveTo(0, -h);
        context.lineTo(-r, h);
        context.lineTo(r, h);
        context.closePath();
      }
    },
    'triangle-down': {
      draw: function (context, size) {
        var r = Math.sqrt(size) / 2,
            h = HalfSqrt3 * r;
        context.moveTo(0, h);
        context.lineTo(-r, -h);
        context.lineTo(r, -h);
        context.closePath();
      }
    },
    'triangle-right': {
      draw: function (context, size) {
        var r = Math.sqrt(size) / 2,
            h = HalfSqrt3 * r;
        context.moveTo(h, 0);
        context.lineTo(-h, -r);
        context.lineTo(-h, r);
        context.closePath();
      }
    },
    'triangle-left': {
      draw: function (context, size) {
        var r = Math.sqrt(size) / 2,
            h = HalfSqrt3 * r;
        context.moveTo(-h, 0);
        context.lineTo(h, -r);
        context.lineTo(h, r);
        context.closePath();
      }
    },
    'stroke': {
      draw: function (context, size) {
        const r = Math.sqrt(size) / 2;
        context.moveTo(-r, 0);
        context.lineTo(r, 0);
      }
    }
  };

  mlp.Object = mlp.createClass({
    area: null,

    plotter: null,

    interactive: true,

    visible: true,

    group: null,

    cursor: 'auto',

    initialize: function(options) {
      this.interactive = ('interactive' in options) ? options.interactive : true;
      this.visible = ('visible' in options) ? options.visible : true;
      this.area = options.area;
      this.plotter = options.plotter;
      this.group = options.group;
      this.cursor = options.cursor || 'auto';
    },

    canvasDistanceToPoint: function(canvasPoint) {
      return Infinity;
    },

    render: function(context) {
    },
  });

  mlp.Point = mlp.createClass(mlp.Object, {
    paperCoords: null,
    dataCoords: null,
    shape: 'circle',
    fill: null,
    stroke: '#1f77b4',

    initialize: function(paperCoords, dataCoords, options) {
      options ||= {};

      this.callSuper('initialize', options);
      this.paperCoords = {...paperCoords};
      this.dataCoords = {...dataCoords};
      this.shape = options.shape || 'circle';
      this.fill = options.fill;
      this.stroke = ('stroke' in options) ? options.stroke : '#1f77b4';
    },

    canvasDistanceToPoint: function(canvasPoint) {
      return mlp.dist(canvasPoint, this.area.paperToCanvas(this.paperCoords));
    },

    render: function(context) {
      let areaBounds = this.area.bounds();
      let cameraBounds = this.area.cameraBounds;

      let q = mlp.Converter.paperToCanvas(this.paperCoords, areaBounds, cameraBounds);

      context.lineWidth = 2;
      context.strokeStyle = this.stroke;
      context.fillStyle = this.fill;
      context.setLineDash([]);

      context.save();

      context.beginPath();
      context.translate(q.x, q.y);

      let shapeSize = 144;

      let shape = this.shape;

      if (typeof shape == 'function') {
        shape(context, shapeSize);
      } else {
        if (!(shape in mlp.pointSymbols)) shape = 'circle';
        mlp.pointSymbols[this.shape].draw(context, shapeSize);
      }

      if (this.stroke) context.stroke();
      if (this.fill) context.fill();

      context.restore();
    },
  });

  mlp.Polyline = mlp.createClass(mlp.Object, {
    paperPoints: null,
    dataPoints: null,
    fill: null,
    stroke: '#1f77b4',

    initialize: function(paperPoints, dataPoints, options) {
      options ||= {};

      this.callSuper('initialize', options);
      this.paperPoints = paperPoints.slice();
      this.dataPoints = dataPoints.slice();
      this.fill = options.fill;
      this.stroke = ('stroke' in options) ? options.stroke : '#1f77b4';
    },

    canvasDistanceToPoint: function(canvasPoint) {
      let canvasPoints = [];

      for (let point of this.paperPoints) {
        canvasPoints.push(this.area.paperToCanvas(point));
      }

      return mlp.distToPolyline(canvasPoint, canvasPoints);
    },

    render: function(context) {
      let areaBounds = this.area.bounds();
      let cameraBounds = this.area.cameraBounds;

      let qs = [];
      for (let p of this.paperPoints) qs.push(mlp.Converter.paperToCanvas(p, areaBounds, cameraBounds));

      context.lineWidth = 2;
      context.strokeStyle = this.stroke;
      context.fillStyle = this.fill;
      context.setLineDash([8, 8]);

      if (qs.length > 0) {
        context.beginPath();
        context.moveTo(qs[0].x, qs[0].y);

        for (let i = 1; i < qs.length; i++) {
          context.lineTo(qs[i].x, qs[i].y);
        }

        if (this.stroke) context.stroke();
        if (this.fill) context.fill();
      }
    },
  });

  mlp.Text = mlp.createClass(mlp.Object, {
    text: null,

    fontFamily: null,
    fontSize: null,
    fontWeight: null,

    rotation: null,

    // Normalized base point before rotation
    // (for example, if it's {x: 0, y: 1}, position will refer to the top-left corner of the text
    normalizedBasePoint: null,

    position: null,

    fill: 'black',

    stroke: '#1f77b4',

    initialize: function(text, options) {
      options ||= {};

      this.callSuper('initialize', options);
      this.text                = text;
      this.fontFamily          = options.fontFamily;
      this.fontSize            = options.fontSize;
      this.fontWeight          = options.fontWeight;
      this.position            = ('position' in options)            ? options.position : {x: 0, y: 0};
      this.normalizedBasePoint = ('normalizedBasePoint' in options) ? options.normalizedBasePoint : {x: 0, y: 1};
      this.rotation            = ('rotation' in options)            ? options.rotation : 0;
      this.fill                = ('fill' in options)                ? options.fill : 'black';
      this.offset              = ('offset' in options)              ? options.offset : {x: 0, y: 0};
      this.stroke              = options.stroke;
    },

    canvasDistanceToPoint: function(canvasPoint) {
      let dist = Infinity;

      let bounds = this.getBounds();
      if (bounds) {
        dist = mlp.distToPolygon(canvasPoint, bounds);
      }

      return dist;
    },

    getBounds: function() {
      let areaBounds = this.area.bounds();
      let cameraBounds = this.area.cameraBounds;

      this.area.context.save();
      this.area.context.font = (this.fontWeight || 'bold') + ' ' + (this.fontSize || 14) + 'px ' + (this.fontFamily || 'sans');
      let textBounds = mlp.rect(mlp.getTextBounds(this.area.context, this.text));
      this.area.context.restore();

      let q = mlp.Converter.paperToCanvas(this.position, areaBounds, cameraBounds);

      let basePointX = (1 - this.normalizedBasePoint.x) * textBounds.x0 + this.normalizedBasePoint.x * textBounds.x1;
      let basePointY = (1 - this.normalizedBasePoint.y) * textBounds.y1 + this.normalizedBasePoint.y * textBounds.y0;

      let x = q.x - basePointX;
      let y = q.y - basePointY;

      let absoluteTextBounds = {...textBounds};
      absoluteTextBounds.x0 += x;
      absoluteTextBounds.x1 += x;
      absoluteTextBounds.y0 += y;
      absoluteTextBounds.y1 += y;

      let angle = this.rotation * Math.PI/180;

      let a = mlp.rotate({x: absoluteTextBounds.x0, y: absoluteTextBounds.y0}, q, angle);
      let b = mlp.rotate({x: absoluteTextBounds.x0, y: absoluteTextBounds.y1}, q, angle);
      let c = mlp.rotate({x: absoluteTextBounds.x1, y: absoluteTextBounds.y1}, q, angle);
      let d = mlp.rotate({x: absoluteTextBounds.x1, y: absoluteTextBounds.y0}, q, angle);

      return [a, b, c, d];
    },

    render: function(context) {
      let areaBounds = this.area.bounds();
      let cameraBounds = this.area.cameraBounds;

      context.save();

      context.font = (this.fontWeight || 'bold') + ' ' + (this.fontSize || 14) + 'px ' + (this.fontFamily || 'sans');
      let textBounds = mlp.rect(mlp.getTextBounds(context, this.text));

      let q = mlp.Converter.paperToCanvas(this.position, areaBounds, cameraBounds);

      let basePointX = (1 - this.normalizedBasePoint.x) * textBounds.x0 + this.normalizedBasePoint.x * textBounds.x1;
      let basePointY = (1 - this.normalizedBasePoint.y) * textBounds.y1 + this.normalizedBasePoint.y * textBounds.y0;

      let x = q.x - basePointX;
      let y = q.y - basePointY;

      context.strokeStyle = this.stroke;
      context.fillStyle = this.fill;

      let angle = this.rotation * Math.PI/180;

      if (angle) {
        context.translate(q.x, q.y);
        context.rotate(-angle);
        context.translate(-q.x, -q.y);
      }

      x += this.offset.x;
      y += this.offset.y;

      if (this.fill)  context.fillText(this.text, x, y);
      if (this.stoke) context.strokeText(this.text, x, y);

      context.restore();
    },
  });

  // What does that mean, exactly
  mlp.Line = mlp.createClass(mlp.Object, {
    x0: 0,
    y0: 0,
    x1: 0,
    y1: 0,

    initialize: function(x0, y0, x1, y1, options) {
      this.callSuper('initialize', options);
      this.x0 = x0;
      this.y0 = y0;
      this.x1 = x1;
      this.y1 = y1;
    },

    canvasDistanceToPoint: function(canvasPoint) {
      return this.distToLine(canvasPoint, {x: this.x0, y: this.y0}, {x: this.x1, y: this.y1});
    }
  });
})();
