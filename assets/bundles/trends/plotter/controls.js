(function () {
  'use strict';

  mlp.Control = mlp.createClass(mlp.Observable, {
    label: null,
    param: null,
    defaultValue: null,

    node: null, // Must be set by subclasses

    initialize: function(options) {
      this.label        = options.label;
      this.param        = options.param;
      this.defaultValue = options.defaultValue;
    },

    getValue: function() {},
    setValue: function(value) {},
  });

  mlp.SelectControl = mlp.createClass(mlp.Control, {
    values: null,
    select: null,

    initialize: function(options) {
      this.callSuper('initialize', options);
      this.values = options.values || [];

      let node = mlp.html('<div class="option"><label class="optionLabel">' + this.label + '</label></div>');
      let select = mlp.html('<select class="optionValue" value="'+ this.defaultValue +'"></select>');
      this.select = select;
      node.appendChild(select);

      for (let value of this.values) {
        this.addItem(value);
      }

      let self = this;
      select.addEventListener("input", () => {
        self.fire('change');
      });

      this.node = node;
    },

    addItem: function(value) {
      this.select.appendChild(mlp.html('<option value="' + value + '">' + value + '</option>'));
    },

    getValue: function() {
      return this.select.value;
    },

    setValue: function(value) {
      this.select.value = value;
    },
  });

  mlp.CheckControl = mlp.createClass(mlp.Control, {
    checkbox: null,

    initialize: function(options) {
      this.callSuper('initialize', options);

      let inputId = this.param;

      let node = mlp.html('<div class="option"><label class="optionLabel" for="' + inputId + '">' + this.label + '</label></div>');
      let checkboxWrapper = mlp.html('<div class="checkboxWrapper"><input type="checkbox" '+ (this.defaultValue ? "checked" : "") +' class="optionValue" id="' + inputId+ '"></input></div>');
      let checkbox = checkboxWrapper.querySelector("input");
      node.appendChild(checkboxWrapper);

      let self = this;
      checkbox.addEventListener("input", () => {
        self.fire('change');
      });

      this.node = node;
      this.checkbox = checkbox;
    },

    getValue: function() {
      return this.checkbox.checked;
    },

    setValue: function(value) {
      this.checkbox.checked = value;
    },
  });

  mlp.NumberControl = mlp.createClass(mlp.Control, {
    input: null,

    initialize: function(options) {
      this.callSuper('initialize', options);
      if (this.defaultValue == null) this.defaultValue = 0;

      let inputId = this.param;

      let node = mlp.html('<div class="option"><label class="optionLabel" for="' + inputId + '">' + this.label + '</label></div>');
      let input = mlp.html('<input type="number" value="'+ this.defaultValue +'" class="optionValue" id="' + inputId + (this.type == "natural" ? "step=1 min=0" : "") + '"></input>');
      node.appendChild(input);

      let self = this;
      input.addEventListener("input", () => {
        self.fire('change');
      });

      this.node = node;
      this.input = input;
    },

    getValue: function() {
      return parseFloat(this.input.value);
    },

    setValue: function(value) {
      this.input.value = value;
    },
  });

  mlp.TextControl = mlp.createClass(mlp.Control, {
    input: null,

    initialize: function(options) {
      this.callSuper('initialize', options);
      if (this.defaultValue == null) this.defaultValue = 0;

      let inputId = this.param;

      let node = mlp.html('<div class="option"><label class="optionLabel" for="' + inputId + '">' + this.label + '</label></div>');
      let input = mlp.html('<input type="text" value="'+ this.defaultValue +'" class="optionValue" id="' + inputId + (this.type == "natural" ? "step=1 min=0" : "") + '"></input>');
      node.appendChild(input);

      let self = this;
      input.addEventListener("input", () => {
        self.fire('change');
      });

      this.node = node;
      this.input = input;
    },

    getValue: function() {
      return this.input.value;
    },

    setValue: function(value) {
      this.input.value = value;
    },
  });

  // Utility functions to make the creation of controls less cumbersome

  mlp.newCheckControl = function(label, param, defaultValue) {
    return new mlp.CheckControl({label, param, defaultValue});
  }

  mlp.newNumberControl = function(label, param, defaultValue) {
    return new mlp.NumberControl({label, param, defaultValue});
  }

  mlp.newSelectControl = function(label, param, defaultValue, values) {
    return new mlp.SelectControl({label, param, defaultValue, values});
  }

  mlp.newTextControl = function(label, param, defaultValue) {
    if (typeof defaultValue == undefined) defaultValue = "";
    return new mlp.TextControl({label, param});
  }
})();
