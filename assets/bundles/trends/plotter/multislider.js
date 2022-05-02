

Multislider = mlp.createClass(mlp.Observable, {
  initialize: function(options) {
    let self = this;

    self.min = options.min;
    self.max = options.max;
    self.handlesConfig = options.handles;
    self.edgesConfig = options.edges;

    self.handleSize = 20;

    let threadHeight = 8;
    let containerHeight = Math.max(threadHeight, this.handleSize);

    let container = mlp.html(`<div style="width:100%; height:${containerHeight}px; position:relative"></div>`)
    self.dom = container;

    let background = mlp.html(`<div style="width:calc(100% - ${self.handleSize}px); height:${threadHeight}px; position:absolute; top:0; bottom:0; margin:auto;"></div>`)
    background.style.left            = (self.handleSize/2) + 'px';
    background.style.borderRadius    = '4px';
    background.style.backgroundColor = '#808080';
    container.appendChild(background);

    self.handles = [];
    self.edges = [];

    for (let i = 0; i < self.handlesConfig.length - 1; i++) {
      let edge = mlp.html('<div style="position:absolute; top:0; bottom:0; margin:auto"></div>');
      edge.style.height          = background.style.height;
      edge.style.borderRadius    = background.style.borderRadius;
      edge.style.backgroundColor = self.edgesConfig ? self.edgesConfig[i].color : '';
      container.appendChild(edge);

      self.edges.push(edge);
    }

    for (let handleConfig of self.handlesConfig) {
      let handle = mlp.html('<div style="position:absolute"></div>');
      handle.style.width           = self.handleSize + 'px';
      handle.style.height          = self.handleSize + 'px';
      handle.style.borderRadius    = self.handleSize + 'px';
      handle.style.backgroundColor = handleConfig.color;
      handle.style.cursor          = 'grab';
      handle.style.top             = ((containerHeight - self.handleSize)/2) + 'px';
      handle.dataset.value         = handleConfig.value;
      container.appendChild(handle);

      self.handles.push(handle);
    }

    (new ResizeObserver(() => {
      self._repositionHandles();
    })).observe(self.dom);

    if (options.parent) {
      options.parent.appendChild(this.dom);
    }

    // - - - - - - - - - - - - - - - - - - - - - - - - - -
    // Mouse/touch interactions
    // - - - - - - - - - - - - - - - - - - - - - - - - - -

    function onHandlePress(e) {
      let handle = e.target;
      self.draggingHandle = handle;
      self.handleAnchor  = {x: parseFloat(handle.style.left), y: parseFloat(handle.style.top)};
      self.pointerAnchor = {x: e.clientX, y: e.clientY};
      document.body.classList.add('dragging');
    }

    function onMove(e) {
      if (!self.draggingHandle) return;
      e.preventDefault();

      let handle = self.draggingHandle;
      let newP = self.handleAnchor.x + (e.clientX - self.pointerAnchor.x);
      newP = Math.max(newP, 0);
      newP = Math.min(newP, self.dom.clientWidth - self.handleSize);
      handle.style.left = newP + 'px';
      handle.dataset.value = self.handlePositionToValue(newP);

      self._reorderHandles();

      self.fire("change", {});
    }

    function onRelease(e) {
      self.draggingHandle = null;
      document.body.classList.remove('dragging');

      self.fire("changed", {});
    }

    function mouseToTouchHandler(mouseHandler) {
      return e => mouseHandler({target: e.target, clientX: e.touches[0].clientX, clientY: e.touches[0].clientY});
    }

    for (let handle of self.handles) {
      handle.addEventListener('mousedown', onHandlePress);
      handle.addEventListener('touchstart', mouseToTouchHandler(onHandlePress));
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onRelease);

    document.addEventListener('touchmove', mouseToTouchHandler(onMove));
    document.addEventListener('touchend', mouseToTouchHandler(onRelease));
  },

  // TODO _reorderHandles and _repositionHandles should be merged, right? Do that when you are more sober

  _repositionHandles: function() {
    for (let handle of this.handles) {
      handle.style.left = this.valueToHandlePosition(handle.dataset.value) + 'px';
    }
    this._reorderHandles();
  },

  _reorderHandles: function() {
    this.handles.sort((a, b) => parseFloat(a.style.left) - parseFloat(b.style.left));
    for (let i = 0; i < this.handles.length; i++) {
      this.handles[i].style.backgroundColor = this.handlesConfig[i].color;
    }
    this._repositionEdges();
  },

  _repositionEdges: function() {
    for (let i = 0; i < this.handles.length - 1; i++) {
      let a = parseFloat(this.handles[i].style.left) + this.handleSize/2;
      let b = parseFloat(this.handles[i+1].style.left) + this.handleSize/2;

      this.edges[i].style.left  = a + 'px';
      this.edges[i].style.width = (b - a) + 'px';
    }
  },

  setValues: function(newValues) {
    for (let i = 0; i < Math.min(this.handles.length, newValues.length); i++) {
      let handle = this.handles[i];
      handle.dataset.value = newValues[i];
      handle.style.left = this.valueToHandlePosition(handle.dataset.value) + 'px';
    }
    this._repositionHandles();
  },

  getValues: function() {
    let v = [];
    for (let handle of this.handles) v.push(+handle.dataset.value);
    return v;
  },

  valueToHandlePosition: function(v) {
    let a = (v - this.min)/(this.max - this.min);
    let p = this.handleSize/2 + a * (this.dom.clientWidth - this.handleSize);
    p -= this.handleSize/2;
    return p;
  },

  handlePositionToValue: function(p) {
    p += this.handleSize/2;
    let a = (p - this.handleSize/2)/(this.dom.clientWidth - this.handleSize);
    let v = this.min + a * (this.max - this.min);
    return v;
  },
});

DateMultislider = mlp.createClass(Multislider, {
  initialize: function(options) {
    if (options.handles) {
      let processedHandles = [];
      for (let handle of options.handles) {
        handle = {...handle}; // crappy cloning
        if (handle.value instanceof Date) {
          handle.value = handle.value.getTime();
        }
        processedHandles.push(handle);
      }
      options.handles = processedHandles;
    }

    if (options.min instanceof Date) options.min = options.min.getTime();
    if (options.max instanceof Date) options.max = options.max.getTime();

    this.callSuper('initialize', options);
  },

  getValues: function() {
    let vs = [];
    for (let v of this.callSuper('getValues')) vs.push(new Date(v));
    return vs;
  },

  setValues: function(newValues) {
    let vs = [];
    for (let v of newValues) vs.push((v instanceof Date) ? v.getTime() : v);
    this.callSuper("setValues", vs);
  },

});
