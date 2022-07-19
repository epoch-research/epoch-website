'use strict';

console.log("I wouldn't look at the current code");

function buildComputeCalculator(hardwareDataUrl) {
  let showFillOptions = true;
  let showFillInMessage = false;

  function tooltip(node, options) {
    return tippy(node, {
      allowHTML: true,
      theme: 'white',
      placement: 'top',
      trigger: 'click',
      //arrow: false,
      interactive: true,
      maxWidth: '400px',
      ...options,
    });
  }

  function makeDropdown(node, values) {
    let selectedResult = null;
    let selectedIndex = -1;
    let selectedItem = null;
    let noDataItem = null;
    let items = [];

    // Oh my god
    let ignoreNextBlur = false;

    let div = document.createElement("div");
    div.classList.add("dropdown");

    document.addEventListener("click", (e) => {
      if (e.target != node && e.target != div && !div.contains(e.target)) {
        div.style.display = "none";
      }
    });

    node.parentNode.appendChild(div);
    node.addEventListener("input", () => updateVisibility());

    if (values) {
      setItems(values);
    }

    function setMessage(msg) {
      div.innerHTML = '';
      div.appendChild(u('<div class="dropdown-message">').html(msg).first());
    }

    function setValues(values) {
      div.innerHTML = '';

      items = [];
      selectedResult = null;
      selectedIndex = -1;
      selectedItem = null;
      noDataItem = null;

      for (let i = 0; i < values.length; i++) {
        let value = values[i];
        let itemDom = document.createElement("div");
        itemDom.href = "#";
        itemDom.innerHTML = value;
        div.appendChild(itemDom);
        itemDom.classList.add("dropdown-item");
        items.push({
          node: itemDom,
          value: value,
        });
        itemDom.addEventListener("pointerdown", () => {
          ignoreNextBlur = true;
        });
        itemDom.addEventListener("click", () => {
          selectedIndex = i;
          onSelectionUpdate(true);
          div.style.display = "none";
        });
      }

      noDataItem = u('<div class="dropdown-item">').html('No data');
      div.appendChild(noDataItem.first());

      if (div.style.display == "") {
        updateVisibility();
      }
    }

    function updateVisibility() {
      div.style.display = "";
      let text = node.value;
      let words = text.trim().split(/\s+/);
      selectedResult = null;
      selectedIndex = -1;
      for (let i = 0; i < items.length; i++) {
        let item = items[i];
        item.node.classList.remove("highlighted-result");

        let matches = true;
        let pattern = new RegExp(words.join('.*'), 'i');
        matches = item.value.match(pattern);
        /*
        for (let word of words) {
          if (!item.value.toLowerCase().includes(word.toLowerCase())) {
            matches = false;
            break;
          }
        }
        */

        if (matches) {
          item.node.classList.remove('invisible');
          if (selectedIndex < 0) {
            selectedIndex = i;
          }
        } else {
          item.node.classList.add('invisible');
        }
      }

      if (selectedIndex >= 0) {
        noDataItem.addClass('invisible');
      } else {
        noDataItem.removeClass('invisible');
      }

      onSelectionUpdate();

      div.style.display = "";
      //div.style.display = selectedResult ? "" : "none";
      //noneDiv.style.display = selectedResult ? "none" : "";
    }

    div.style.display = "none";

    node.addEventListener("blur", focusHandler, false);
    node.addEventListener("focus", focusHandler, false);
    node.addEventListener("keydown", onKey, false);

    function onSelectionUpdate(commitValue) {
      for (let other of items) {
        other.node.classList.remove("highlighted-result");
      }

      node.setCustomValidity("invalid");

      if (selectedIndex < 0) return;

      node.setCustomValidity("");

      let item = items[selectedIndex];

      item.node.classList.add("highlighted-result");

      //item.node.scrollIntoView();//{ block: 'center' });
      //item.node.scrollIntoView({ block: 'nearest', inline: 'start' });

      let container = div;
      let element = item.node;

      //Get container properties
      let cTop = container.scrollTop;
      let cBottom = cTop + container.clientHeight;

      //Get element properties
      let eTop = element.offsetTop;
      let eBottom = eTop + element.clientHeight;

      let topDiff = cTop - eTop;
      let bottomDiff = eBottom - cBottom;

      if (cTop > eTop) container.scrollTop = eTop;
      if (eBottom > cBottom) container.scrollTop = eBottom - container.clientHeight;

      //div.scrollTop = item.node.offsetTop;
      //item.node.offsetTop;

      selectedResult = item.value;
      node.dataset.value = item.value;
      if (commitValue) {
        node.value = item.value;
        //node.select();
      }

      //document.dispatchEvent(new Event('input', {bubbles: true}));
      //node.dispatchEvent(new Event('input', {bubbles: true}));
      u(node).trigger('customInput');
    }

    function onKey(e) {
      if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
        let direction = (e.key == "ArrowUp") ? -1 : +1;

        let index = selectedIndex;
        selectedIndex = -1;
        let count = 0;
        while (count++ < items.length) {
          index += direction;
          if (index < 0) index += items.length;
          index = index % items.length;

          if (!items[index].node.classList.contains('invisible')) {
            selectedIndex = index;
            break;
          }
        }

        onSelectionUpdate(true);

        e.preventDefault();
      }

      if (div.style.display != "none") {
        if ((e.key == 'Tab' && selectedResult != node.value) || e.key == 'Enter') {
          if (selectedResult) {
            node.value = selectedResult;
            node.dispatchEvent(new Event('input', {bubbles:true}));
            //node.selectionStart = node.selectionEnd;
          }
          div.style.display = "none";
          e.preventDefault();
        }
      }
    }

    function focusHandler(e) {
      if (e.type === "blur") {
        if (!ignoreNextBlur) {
          div.style.display = "none";
        }
        ignoreNextBlur = false;
      } else {
        div.style.display = "";
        //node.select();
        updateVisibility();
      }
    }

    let self = {};
    self.setMessage = setMessage;
    self.setValues = setValues;
    return self;
  }

  let hardwareSheet = null;
  let hardwareSheetError = false;

  /*
  makeDropdown(hardwarePrecision, ["Double (FP64)", "Single (FP32)", "Half (FP16)"]);
  makeDropdown(trainingTimeUnit, ["Hours", "Days", "Years"]);
  */

  // Store last validated inputs
  for (let input of document.getElementsByTagName("input")) {
    input.dataset.value = input.value;
    if (input.id == "trainingTimeUnit" || input.id == "hardwareType" || input.id == "hardwarePrecision") continue;
    input.addEventListener("input", () => {
      if (input.checkValidity()) {
        input.dataset.value = input.value;
      }
    });
  }

  for (let select of document.getElementsByTagName("select")) {
    select.dataset.value = select.value;
    select.addEventListener("input", () => {
      select.dataset.value = select.value;
    });
  }

  class Method {
    container;
    dom;
    outputId;
    title;
    computeCompute = () => {};
    updateCallbacks = [];

    constructor(container, title) {
      container = u(container);
      this.container = container;
      this.title = title;
      this.render(container, title);
    }

    setFormula(formula) {
      this.dom.children('.description-wrapper').prepend('<span class="block-label">Formula</span>');
      this.dom.children('.description-wrapper').children('.description')
        .append(u('<div class="formula">').html(formula))
    }

    addBlock(label, options = {}) {
      let customContent = options.block;
      let inputType     = ('inputType' in options) ? options.inputType : 'scientific';
      let units         = options.units;
      let info          = options.info;
      let subtitle      = options.subtitle;
      let value         = options.value;
      let min           = ('min' in options) ? options.min : 0;
      let max           = ('max' in options) ? options.max : Infinity;

      let id = Utils.camelize(label);

      let block = u('<div class="block">');
      block.append(`<div class="name">${label} `)

      if (subtitle) {
        block.append(`<div class="subtitle">${subtitle} `)
      }

      if (info) {
        let infoDom = u('<a class="bi bi-info-circle-fill info">');
        block.children('.name').append(infoDom);

        tooltip(infoDom.first(), {
          content: info,
        });
      }

      let inputDiv = u(`<div>`);
      if (customContent) {
        inputDiv.append(customContent);
      } else {
        inputDiv.append(new ScientificInput({min: min, max: max, inputId: id, classes: 'small', inputClasses: 'method-input', type: inputType, value: value}).dom);
      }
      if (units) {
        inputDiv.append(`<span class="units">${units}`)
      }
      block.append(inputDiv);

      this.dom.children('.dumb-inputs-wrapper').children('.inputs').append(block);
      return block;
    }

    addBreak() {
      this.dom.children('.dumb-inputs-wrapper').children('.inputs').append('<div class="break">');
    }

    update() {
      let inputs = {};
      let valid = true;

      for (let input of this.dom.first().querySelectorAll('input, select')) {
        if (!input.classList.contains('method-input')) continue;

        if (!input.checkValidity() || ((input.type == 'number' || input.classList.contains('number-input')) && Number.isNaN(parseFloat(input.value)))) {
          valid = false;
          continue;
        }
        inputs[input.id] = ((input.type == 'number' || input.classList.contains('number-input')) ? parseFloat(input.value) : input.value);
      }

      let compute = this.computeCompute(inputs);
      document.getElementById(this.outputId).innerHTML = valid ? Utils.formatReal(compute) : "--";

      let summary = this.getPaperSummary({inputs, compute, valid});
      this.dom.first().querySelector('.paper-summary').innerHTML = summary;

      for (let callback of this.updateCallbacks) {
        callback({
          inputs: inputs,
          compute: compute,
          valid: valid,
        });
      }
    }

    render(container, title) {
      let dom = u('<div class="method">');
      dom.html(`
        <div class="name"></div>
        <div class="description-wrapper">
          <div class="description"></div>
        </div>
        <div class="dumb-inputs-wrapper">
          <div class="inputs"></div>
        </div>
        <div class="separator output-separator"></div>
        <div class="output"></div>
      `);
        
      dom.children('.name').html(title);

      let outputId = "result-" + Utils.camelize(title);
      dom.children('.output').html(`<div>Compute <span class="result-number"><span id="${outputId}">--</span> FLOPs</span></div>`);
      dom.children('.output').append(u('<p style="margin-top: 0.4em; margin-bottom: 0.5em; color: #444 !important"><i>Copy and paste the following information in your paper'));
      dom.children('.output').append(u('<div class="boxed-text paper-summary" style="background-color: #ddd; color: #444; margin-bottom: 0; border-radius: 4px">'));

      dom.on('input', () => this.update());

      container.append(dom);

      this.outputId = outputId;
      this.dom = dom;
    }

    onUpdate(callback) {
      this.updateCallbacks.push(callback);
    }
  }

  class Utils {
    static camelize(str) {
      let result = str.split(/[^\w]/).map((word, index) => {
        word = word.toLowerCase();
        if (index > 0) {
          word = Utils.capitalize(word);
        }
        return word;
      }).join('');
      return result;
    }

    static capitalize(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    }

    static parseFloat(s) {
      if (!s) return s;
      if (s.endsWith('e')) return +(s + '0');
      if (s.startsWith('e')) return +('1' + s);
      return +s;
    }

    static formatReal(x, threshold = 1e2) {
      return (x < threshold) ? ((Math.floor(x) == x) ? x : x.toFixed(2)) : x.toExponential(1).replace('e+', 'e');
    }
  }

  class ScientificInput {
    allowExponents;
    dom;
    input;
    minusButton;
    plusButton;
    min;
    max;
    exponentialFormatOptions;
    normalFormatOptions
    showButtons = false;
    enableUpDownArrows = false;
    lastRawValue = '';

    constructor(options = {}) {
      this.exponentialFormatOptions = {
        lowThreshold: 1e2,
        decimalPlaces: 2,
        exponentialDecimalPlaces: 1,
      };

      this.normalFormatOptions = {
        lowThreshold: Infinity,
        decimalPlaces: 2,
      };

      this.type = ('type' in options) ? options.type : 'scientific';
      this.allowExponents = (options.type == 'scientific');

      let value = options.value;
      this.min = ('min' in options) ? options.min : -Infinity;
      this.max = ('max' in options) ? options.max : +Infinity;

      let inputOptions = "";
      if (this.min != -Infinity) inputOptions += " min=" + this.min;
      if (this.max != +Infinity) inputOptions += " max=" + this.max;

      let classes = 'scientific-input';
      if (options.classes) classes += ' ' + options.classes;

      let inputClasses = '';
      if (options.inputClasses) inputClasses = options.inputClasses;

      this.dom = u(`<div class="scientific-input ${classes}">`);
      this.input = u(`<input type='${this.allowExponents ? "text" : "number"}' class='number-input ${inputClasses}' step='any' ${inputOptions} inputmode='text' value=${value}>`);

      this.dom.append(this.input);

      if (this.showButtons) {
        this.minusButton = u('<div class="bi bi-dash minus-button">');
        this.plusButton  = u('<div class="bi bi-plus plus-button">');

        this.dom.append(this.minusButton);
        this.dom.append(this.plusButton);

        this.minusButton.on('click', () => {
          this.stepDown();
        });

        this.plusButton.on('click', () => {
          this.stepUp();
        });
      } else {
        this.dom.addClass('no-buttons');
      }

      if (options.inputId) this.input.first().id = options.inputId;
      if (options.container) u(options.container).append(this.dom);

      if (this.enableUpDownArrows) {
        this.input.on('keydown', (e) => {
          if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
            if (e.key == 'ArrowUp') this.stepUp();
            if (e.key == 'ArrowDown') this.stepDown();
            e.preventDefault();
          }
        });
      }

      this.input.on('input', (e) => {
        //if (!this.input.first().value.match(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]*)?$/)) {
        if (!this.input.first().value.match(/^[-+0-9.eE]*$/)) {
          this.input.first().value = this.lastRawValue;
          return;
        }

        let value = this.input.first().value;
        this.lastRawValue = value;

        let empty = (value == "");
        let invalid = (!empty && !value.match(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]*)?$/));
        if (!empty && !invalid) {
          let x = parseFloat(value);
          invalid = (x < this.min || x > this.max);
        }

        this.dom.removeClass('valid');
        this.dom.removeClass('invalid');
        this.input.first().setCustomValidity("");
        if (invalid) {
          this.input.first().setCustomValidity("invalid");
          this.dom.addClass('invalid');
        } else if (!empty) {
          this.dom.addClass('valid');
        }
      });

      // Force processing of the default value :(
      this.input.trigger('input');
    }

    get val() {
      let v = this.input.first().value;
      return parseFloat(v ? v : 0);
    }

    set val(x) {
      this.input.first().value = this.formatReal(x);
      this.input.trigger('input');
    }

    get inExponentialMode() {
      return this.input.first().value.toLowerCase().includes('e');
    }

    set inExponentialMode(v) {
      let formatOptions = v ? this.exponentialFormatOptions : this.normalFormatOptions;
      this.input.first().value = this.formatReal(x, formatOptions);
    }

    formatReal(x) {
      let str = x.toString();
      if (this.inExponentialMode) {
        str = x.toExponential(this.exponentialFormatOptions.exponentialDecimalPlaces).replace('e+', 'e');
      }

      return str;
    }

    stepDown() {
      let x = this.val;

      if (this.inExponentialMode) {
        x /= 10;
      } else {
        x--;
      }

      /*
      if (x/10 < this.exponentialFormatOptions.lowThreshold) {
        x--;
      } else {
        x /= 10;
      }
      */

      if (this.max != null) x = Math.min(x, this.max);
      if (this.min != null) x = Math.max(x, this.min);

      this.val = x;
      this.input.trigger('change');
    }

    stepUp() {
      let x = this.val;

      if (this.inExponentialMode) {
        x *= 10;
      } else {
        x++;
      }

      /*
      if (x < this.exponentialFormatOptions.lowThreshold) {
        x++;
      } else {
        x *= 10;
      }
      */

      if (this.max != null) x = Math.min(x, this.max);
      if (this.min != null) x = Math.max(x, this.min);

      this.val = x;
      this.input.trigger('change');
    }
  }

  class ComputeCalculator {
    static formatRealForSummary(x) {
      if (typeof x == 'undefined' || Number.isNaN(x)) return '--';
      return (x < 10) ? x : x.toExponential(1).replace('e+', 'e');
    }

    static renderMethod1(container) {
      let method = new Method(container, 'Method 1: Counting the number of arithmetic operations');

      method.setFormula('<span>compute</span> = <span id="opPerForwardPass" class="formula-block">2 × # of connections</span> × <span id="backForAdjustment" class="formula-block">3</span> × <span id="numberOfPasses" class="formula-block"># of training examples × # of epochs</span>');

      let opPerForwardPass  = u('#opPerForwardPass', method.dom.first()).first();
      let backForAdjustment = u('#backForAdjustment', method.dom.first()).first();
      let numberOfPasses    = u('#numberOfPasses', method.dom.first()).first();

      let opPerForwardPassInfo = `
        <p>Number of operations in a forward pass.</p>

        <p>Typically, for each connection in the network we perform a multiplication and an addition during the forward pass. Other operations are often only applied to individual neuron layers and are orders of magnitude less compute-intensive.</p>

        <p>Thus the number of operations in a forward pass is approximately equal to twice the number of connections.</p>
      `;

      let backForAdjustmentInfo = `
        <p>Backward-forward adjustment.</p>

        <p>Usually, the total number of operations in the backward pass is roughly twice (x2) the number of operations in a forward pass.</p>

        <p>So the total number of operations per complete pass equals three times (x3) the number of operations per forward pass.</p>

        <p>You can learn more about why this is the case and exceptions in our post on the <a href="/blog/backward-forward-FLOP-ratio">Backward-Forward FLOP ratio</a>.</p>
      `;

      tooltip(opPerForwardPass,  { content: opPerForwardPassInfo,  appendTo: method.dom.first(), maxWidth: '400px',});
      tooltip(backForAdjustment, { content: backForAdjustmentInfo, appendTo: method.dom.first(), maxWidth: '400px',});
      tooltip(numberOfPasses,    { content: 'Number of passes.',   appendTo: method.dom.first(), maxWidth: 'none', });

      let numberOfConnectionsInfo = `
        <p>This is the number of direct interdependencies between neurons in a neural network.</p>

        <p>For example, a fully connected layer with N neurons as inputs and M neurons as output has N*M connections.</p>

        <p>Typically this will be equal to the number of parameters of the model, though this is not the case when some weights are reused in different connections, as with CNNs.</p>

        <p>Bias terms are comparatively fewer, and can often be ignored.</p>
      `;

      let numberOfEpochsInfo = 'Number of complete passes over the training dataset';

      method.addBlock('Number of connections', {info: numberOfConnectionsInfo});
      method.addBlock('Number of training examples');
      method.addBlock('Number of epochs', {info: numberOfEpochsInfo});

      method.computeCompute = (inputs => 2 * inputs.numberOfConnections * 3 * inputs.numberOfTrainingExamples * inputs.numberOfEpochs);

      method.getPaperSummary = ({inputs, compute}) => {
        let forwardPassCompute = 2 * inputs.numberOfConnections;

        let method1PaperSummary = document.querySelector('#method1-paper-summary');

        let summary = `Our model uses ${this.formatRealForSummary(forwardPassCompute)} FLOP on each forward pass, was trained on ${this.formatRealForSummary(inputs.numberOfTrainingExamples)} datapoints and used ${this.formatRealForSummary(compute)} FLOP during training.`;

        return summary;
      };

      method.dom.trigger('input');

      return method;
    }

    static renderMethod2(container) {
        let method = new Method(container, 'Method 2: Hardware details and usage');
        method.setFormula('compute = training time × # of GPUs/TPUs × peak FLOP/s × <span id="utilizationRate" class="formula-block">utilization rate</span>');

        method.dom.addClass('method2');

        let utilizationRateFormulaInfo = 'Percentage of the theoretical peak FLOPS that was achieved on average during training.';
        tooltip(u('#utilizationRate', method.dom.first()).first(), { content: utilizationRateFormulaInfo, appendTo: method.dom.first(), maxWidth: '400px',});

        // Custom time input block

        let timeBlock = u('<div class="input-set">');

        let trainingTime = u('<input id="trainingTime" type="hidden" class="method-input" required>');
        timeBlock.append(trainingTime);

        let trainingTimeAmountWrapper = new ScientificInput({min: 0, inputId: 'trainingTimeAmount', classes: 'small', inputClasses: 'method-input', required: true});
        timeBlock.append(u('<div class="input-wrapper">').append(trainingTimeAmountWrapper.dom));
        let trainingTimeAmount = trainingTimeAmountWrapper.input;

        let trainingTimeUnit = u('<select id="trainingTimeUnit" class="method-input" value="hour">')
          .append('<option value="hour">Hours')
          .append('<option value="day" selected>Days')
          .append('<option value="year">Years');
        timeBlock.append(u('<div class="input-wrapper">').append(trainingTimeUnit));

        [trainingTimeAmount, trainingTimeUnit].forEach(x => x.on('input', () => {
          let trainingTimeInUnits = trainingTimeAmount.first().value;
          let unit = trainingTimeUnit.first().value;

          let unitInSeconds = 1;
          if (unit == 'hour') unitInSeconds = 60 * 60;
          if (unit == 'day')  unitInSeconds = 60 * 60 * 24;
          if (unit == 'year') unitInSeconds = 60 * 60 * 24 * 365;

          trainingTime.first().value = trainingTimeInUnits * unitInSeconds;
        }));

        //u(trainingTimeAmount).trigger('input');

        // Custom Peak FLOP/s block
        let flopSBlock = u('<div class="input-set">');

        if (showFillOptions) {
          flopSBlock.append(u('<div class="test">').html(`
            <label class="container active" id="fillHardwareDetails"><span>Fill using hardware details</span></label>
            <label class="container" id="fillFlopSDirectly"><span>Fill FLOP/s directly</span></label>
          `));

          let fillHardwareDetails = u('#fillHardwareDetails', flopSBlock.first());
          let fillFlopSDirectly = u('#fillFlopSDirectly', flopSBlock.first());
          fillHardwareDetails.on('click', () => {
            fillHardwareDetails.addClass('active');
            fillFlopSDirectly.removeClass('active');
            onHardwareUpdate();
          });
          fillFlopSDirectly.on('click', () => {
            fillFlopSDirectly.addClass('active');
            fillHardwareDetails.removeClass('active');
            onHardwareUpdate();
          });
        }

        let peakFlopSInput = u('<div class="input-wrapper invisible" id="peakFlopSWrapper" style="flex: 1 0 10%">').html(`
            <div>
              <label for="peakFlopS" class="input-label" style="display: inline-block">Peak FLOP/s</label>
              <a id="peakFlopSInfo" class="bi bi-info-circle-fill info"></a>
        `);

        let peakFlopSInfo = `
          <p>Theoretical peak FLOP/s of the system.</p>
          <p>You can often find information about peak performance in your hardware providers' websites.</p>
        `;

        tooltip(u("#peakFlopSInfo", peakFlopSInput.first()).first(), {content: peakFlopSInfo, maxWidth: '400px',});

        peakFlopSInput.append(new ScientificInput({min: 0, inputId: 'peakFlopS', classes: 'small', inputClasses: 'method-input', required: true, value: null}).dom);

        flopSBlock.append(peakFlopSInput);
        //peakFlopSInput.addClass("invisible");

        let hardwareContainer = flopSBlock;

        if (showFillInMessage) {
          //hardwareContainer = u('<div style="flex: 60%; display: flex; flex-wrap: wrap;">');
          //flopSBlock.append(hardwareContainer);
          hardwareContainer = flopSBlock;
        }

        hardwareContainer.append(u('<div class="input-wrapper" style="flex: 0 1 18em; margin-right: 0.5em;">').html(`
            <label for="hardwareType" class="input-label">Hardware</label>
            <div class="dropdown-wrapper">
              <input id="hardwareType" autocomplete="off" class="method-input" placeholder="Select hardware" style="width: 100%">
            </div>
        `));

        let div = u('<div style="display: flex; align-items: flex-end;">');
        hardwareContainer.append(div);

        div.append(u('<div class="input-wrapper" style="flex: 0 0 7em; margin-right: 0.2em;">').html(`
            <div>
              <label for="hardwarePrecision" class="input-label" style="display: inline-block">Precision</label>
              <a id="precisionInfo" class="bi bi-info-circle-fill info"></a>
            </div>
            <div class="dropdown-wrapper">
              <!--
              <input id="hardwarePrecision" value="Single (FP32)" required></input>
              -->
              <select id="hardwarePrecision" value="Single (FP32)" required>
                <!--<option value="fp64">Double (FP64)</option>-->
                <option value="fp32" selected>Single (FP32)</option>
                <option value="fp16">Half (FP16)</option>
              </select>
            </div>
        `));

        let precisionInfo = `
          <p>The number format used to represent the parameters being trained.</p>
          <p>By default, Pytorch and Tensorflow use single precision (FP32), though they have dedicated options for half-precision (FP16) training.</p>
        `;

        tooltip(u("#precisionInfo", div.first()).first(), {content: precisionInfo, maxWidth: '400px',});

        div.append(u('<div class="input-wrapper" style="flex: 1 0 9em; font-size: 0.9em">').html(`
            <span id="peakFlopSChecker" class="quiet-text" style="min-width: 7em; line-height: 32px;"></span>
        `));

        u("#peakFlopSChecker", flopSBlock.first()).html('');

        let hardwareType = u('#hardwareType', hardwareContainer.first());
        let hardwarePrecision = u('#hardwarePrecision', hardwareContainer.first());

        u([hardwareType.first(), hardwarePrecision.first()]).on('input, customInput', () => onHardwareUpdate());

        function onHardwareUpdate() {
          if (!hardwareSheet) return;

          let precisionToRow = {
            "fp64": "FP64 (double precision) Performance (FLOP/s)",
            "fp32": "FP32 (single precision) Performance (FLOP/s)",
            "fp16": "FP16 (half precision) Performance (FLOP/s)",
          };

          let hardwareTypeValue = hardwareType.first().value;
          let hardwarePrecisionValue = hardwarePrecision.first().value;

          let peakFlopSStr = '';
          let hardwareValid = false;

          for (let row of hardwareSheet) {
            if (row["Name of the hardware"] == hardwareTypeValue) {
              hardwareValid = true;
              peakFlopSStr = row[precisionToRow[hardwarePrecisionValue]];
              break;
            }
          }

          hardwareType.first().setCustomValidity("");
          hardwareType.removeClass("valid");
          if (hardwareValid) {
            hardwareType.addClass("valid");
          } else if (hardwareTypeValue != "") {
            hardwareType.first().setCustomValidity("No hardware found");
          }

          hardwarePrecision.first().setCustomValidity("");
          hardwarePrecision.removeClass("valid");
          if (peakFlopSStr.length > 0) {
            hardwarePrecision.addClass("valid");
          } else if (hardwareValid) {
            hardwarePrecision.first().setCustomValidity("No data for precision");
          }

          if (peakFlopSStr.length > 0) {
            u("#peakFlopSChecker", flopSBlock.first()).html(`(${Utils.formatReal(+peakFlopSStr)} FLOP/s)`);
            u('#peakFlopS', peakFlopSInput.first()).first().value = Utils.formatReal(+peakFlopSStr);
          } else {
            u("#peakFlopSChecker", flopSBlock.first()).html((!hardwareValid || hardwareTypeValue.length == 0) ? '' : '(no data for precision)');
            u('#peakFlopS', peakFlopSInput.first()).first().value = '';
          }

          u('#peakFlopS', peakFlopSInput.first()).trigger('input');
      }

      if (showFillOptions) {
        let hardwareDetailsInputs = [];
        hardwareDetailsInputs.push(u('#hardwarePrecision', hardwareContainer.first()).parent().parent().first());
        hardwareDetailsInputs.push(u('#hardwareType', hardwareContainer.first()).parent().parent().first());
        hardwareDetailsInputs.push(u('#peakFlopSChecker', hardwareContainer.first()).parent().first());
        hardwareDetailsInputs = u(hardwareDetailsInputs);

        let flopSInput = u('#peakFlopSWrapper', hardwareContainer.first());
        flopSInput.addClass('text-like-input');

        flopSBlock.append(flopSInput.remove());

        let fillHardwareDetails = u('#fillHardwareDetails', flopSBlock.first());
        let fillFlopSDirectly = u('#fillFlopSDirectly', flopSBlock.first());

        //u('#peakFlopS', hardwareContainer.first()).attr('disabled', true);
        peakFlopSInput.addClass('invisible');

        fillHardwareDetails.on('click', () => {
          fillHardwareDetails.addClass('active');
          fillFlopSDirectly.removeClass('active');
          hardwareDetailsInputs.removeClass('invisible');
          flopSInput.addClass('text-like-input');
          //u('#peakFlopS', hardwareContainer.first()).attr('disabled', true);
          peakFlopSInput.addClass('invisible');
        });
        fillFlopSDirectly.on('click', () => {
          fillFlopSDirectly.addClass('active');
          fillHardwareDetails.removeClass('active');
          hardwareDetailsInputs.addClass('invisible');
          flopSInput.removeClass('text-like-input');
          peakFlopSInput.removeClass('invisible');
        });
      } else {
        //u('#peakFlopS', hardwareContainer.first()).removeClass('small');
        peakFlopSInput.removeClass("invisible");
      }

      let peakFlopSTitle = 'Peak FLOP/s';
      if (showFillInMessage) {
        /*
        let fillHardwareDetails = u('#fillHardwareDetails', flopSBlock.first());
        let fillFlopSDirectly = u('#fillFlopSDirectly', flopSBlock.first());
        fillHardwareDetails.remove();
        fillFlopSDirectly.remove();

        flopSBlock.append(fillHardwareDetails);
        flopSBlock.append(fillFlopSDirectly);
        u('#peakFlopS', hardwareContainer.first()).removeClass('small');
        */

        peakFlopSTitle += '<br><span class="quiet-text">If you don\'t know the peak FLOP/s, fill in the hardware details instead.</span>';
      }

      let flopSBlockInfo = `
        <p>Consult the hardware details database <a href="https://docs.google.com/spreadsheets/d/1iX9ltegY0Ba1ElaLXlxcEi-Je7Qdr1slXju2Ns9XXzg/edit#gid=0">here</a>.</p>
        <p>You can suggest changes to the database by filling <a href="https://docs.google.com/forms/d/e/1FAIpQLSd0ANDeYf9truvkPn1HR1Z3I1fy8O2AZOF7hpK8iMHr3H2sZw/viewform?usp=sf_link">this form</a> or additions by filling <a href="https://docs.google.com/forms/d/e/1FAIpQLSexq86cydEh36zA_A1FT0xT7gZCdazFS7Qi2GCFVLnO985iwQ/viewform?usp=sf_link">this one</a>.</p>
      `;

      let dropdown = makeDropdown(u('#hardwareType', flopSBlock.first()).first());

      let i = 0;
      function updateLoadingMessage() {
        if (!hardwareSheet && !hardwareSheetError) {
          dropdown.setMessage("Loading hardware data." + ('.').repeat((i++)/2 % 3));
          setTimeout(updateLoadingMessage, 300);
        }
      }
      updateLoadingMessage();

      Papa.parse(hardwareDataUrl, {
        download: true,
        header: true,
        complete: function(result) {
          hardwareSheet = result.data;
          let strCmp = (a, b) => (a < b) ? -1 : (a > b) ? +1 : 0;
          hardwareSheet.sort((a, b) => strCmp(a["Name of the hardware"], b["Name of the hardware"]));
          let hardwareTypes = result.data.map(x => x["Name of the hardware"]);
          dropdown.setValues(hardwareTypes);
        },
        error: function(result) {
          hardwareSheetError = true;
          dropdown.setMessage("Error downloading hardware data");
        },
      });

      let utilizationRateInfo = `
        <p>Percentage of the theoretical peak FLOPS that was achieved on average during training.</p>
        <p>In reports and conversation with practitioners we have seen utilization rates between 25% and 62%.</p>
        <p>We are uncertain about what utilization rate is best, but our recommendation is 30% for Large Language Models and 40% for other models.</p>
      `;

      method.addBlock('Training time',       {block: timeBlock});
      method.addBlock('Number of GPUs/TPUs', {inputType: 'normal'});
      method.addBlock(peakFlopSTitle,        {block: flopSBlock}).addClass('full-flex');
      method.addBlock('Utilization rate',    {value: 30, min: 0, max: 100, units: '%', inputType: 'normal', info: utilizationRateInfo});

      method.computeCompute = (inputs => {
        return inputs.trainingTime * inputs.numberOfGpusTpus * inputs.peakFlopS * inputs.utilizationRate/100;
      });

      method.getPaperSummary = ({inputs, compute}) => {
        let trainingTimeAmount = inputs.trainingTimeAmount;
        let trainingTimeUnit = inputs.trainingTimeUnit;

        let method2PaperSummary = document.querySelector('#method2-paper-summary');

        let timeStr = `${trainingTimeAmount} ${trainingTimeUnit}`;
        if (trainingTimeAmount != 1) timeStr += 's';

        let summary = 'Our model was trained';
        if (inputs.hardwareType) {
          summary += ` on a ${inputs.hardwareType}`;
        } else if (inputs.peakFlopS) {
        }
        summary += ` for ${timeStr}, and in total used ${this.formatRealForSummary(compute)} FLOP during training.`;

        return summary;
      };

      method.update();
      //method.dom.trigger('input');

      return method;
    }
  }

  return {calculator: ComputeCalculator, Utils};
}
