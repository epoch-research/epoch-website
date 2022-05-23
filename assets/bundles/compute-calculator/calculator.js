'use strict';

function buildComputeCalculator(hardwareDataUrl) {
  let showFillOptions = true;
  let showFillInMessage = false;

  /*
  let metaOptions = u('<div style="margin-bottom: 1em">').html(`
    <div><input id="showFillOptions" ${showFillOptions ? "checked" : ""} type="checkbox">Show fill options</input></div>
    <div><input id="showFillInMessage" ${showFillInMessage ? "checked" : ""} type="checkbox">Show fill in message</input></div>
  `);

  metaOptions.on('input', () => {
    showFillOptions = window.showFillOptions.checked;
    showFillInMessage = window.showFillInMessage.checked;
    u('.method-container').html('');
    ComputeCalculator.renderMethod2('.method-container');
    ComputeCalculator.renderMethod1('.method-container');
  })

  u('body').prepend(metaOptions);
  */

  function makeDropdown(node, values) {
    let selectedResult;
    let selectedIndex = -1;
    let selectedItem = null;
    let noDataItem = null;

    // Oh my god
    let ignoreNextBlur = false;

    let div = document.createElement("div");
    div.classList.add("dropdown");

    let items = [];
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

    document.addEventListener("click", (e) => {
      if (e.target != node && e.target != div && !div.contains(e.target)) {
        div.style.display = "none";
      }
    });

    node.parentNode.appendChild(div);
    node.addEventListener("input", () => updateVisibility());

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
  }

  let hardwareSheet = null;

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

  updateResults();
  document.addEventListener("input", () => updateResults());

  function updateResults() {
    return;
    //
    // Method 1
    //

    let result1 = 2 * (+numberOfConnections.dataset.value) * 3 * (+numberOfTrainingExamples.dataset.value) * (+numberOfEpochs.dataset.value);
    window.method1Result.innerHTML = formatReal(result1);

    //
    // Method 2
    //

    let hardwareValid = hardwareType.checkValidity() &&
                        hardwarePrecision.checkValidity() &&
                        hardwareSheet != null;

    let valid = trainingTime.checkValidity() &&
                trainingTimeUnit.checkValidity() &&
                numberOfCores.checkValidity() &&
                hardwareValid &&
                utilizationRate.checkValidity();

    if (!hardwareValid) {
      peakFlopSOutput.innerHTML = "--";
    }

    if (!valid) {
      window.method2Result.innerHTML = "--";
    } else {
      let trainingTimeUnitToSeconds = {
        "years":  86400*365,
        "days":   86400,
        "hours":  3600,
      };
      let trainingTimeInSeconds = (+trainingTime.dataset.value) * trainingTimeUnitToSeconds[trainingTimeUnit.dataset.value.toLowerCase()];

      let peakFlopS = 0;
      let precisionToRow = {
        "Double (FP64)": "FP64 (double precision) Performance (FLOP/s)",
        "Single (FP32)": "FP32 (single precision) Performance (FLOP/s)",
        "Half (FP16)": "FP16 (half precision) Performance (FLOP/s)",
      };

      for (let row of hardwareSheet) {
        if (row["Name of the hardware"] == hardwareType.dataset.value) {
          peakFlopS = +row[precisionToRow[hardwarePrecision.dataset.value]];
          break;
        }
      }

      peakFlopSOutput.innerHTML = formatReal(peakFlopS);
      let result2 = trainingTimeInSeconds * (+numberOfCores.dataset.value) * peakFlopS * (+utilizationRate.dataset.value)/100;
      window.method2Result.innerHTML = formatReal(result2);
    }
  }

  function formatReal(x, options = {}) {
    let lowThreshold = ('lowThreshold' in options) ? options.lowThreshold : 1e2;
    let decimalPlaces = ('decimalPlaces' in options) ? options.decimalPlaces : 2;
    let exponentialDecimalPlaces = ('exponentialDecimalPlaces' in options) ? options.exponentialDecimalPlaces : 1;
    return (x < lowThreshold) ? ((Math.floor(x) == x) ? x : x.toFixed(decimalPlaces)) : x.toExponential(exponentialDecimalPlaces).replace('e+', 'e');
  }

  class Method {
    container;
    dom;
    outputId;
    title;
    computeCompute = () => {};

    constructor(container, title) {
      container = u(container);
      this.container = container;
      this.title = title;
      this.render(container, title);
    }

    setFormula(formula) {
      this.dom.children('.description-wrapper').prepend('<span class="block-label">Formula</span>');
      this.dom.children('.description-wrapper').children('.description')
        .append(u('<div class="formula">').append(u('<p>').html(formula)))
    }

    addBlock(label, options = {}) {
      let customContent = options.block;
      let inputType     = ('inputType' in options) ? options.inputType : 'scientific';
      let units         = options.units;
      let info          = options.info;
      let subtitle      = options.subtitle;
      let defaultValue  = ('defaultValue' in options) ? options.defaultValue : 0;
      let min  = ('min' in options) ? options.min : 0;
      let max  = ('max' in options) ? options.max : Infinity;

      let id = Utils.camelize(label);

      let block = u('<div class="block">');
      block.append(`<div class="name">${label} `)

      if (subtitle) {
        block.append(`<div class="subtitle">${subtitle} `)
      }

      if (info) {
        let infoDom = u('<a class="bi bi-info-circle-fill info">');
        block.children('.name').append(infoDom);

        tippy(infoDom.first(), {
          content: `${info}`,
          allowHTML: true,
          theme: 'calculator',
          trigger: 'click',
          placement: 'top',
          //arrow: false,
          interactive: true,
          maxWidth: '200px',
        });
      }

      let inputDiv = u(`<div>`);
      if (customContent) {
        inputDiv.append(customContent);
      } else {
        inputDiv.append(new ScientificInput({min: min, max: max, inputId: id, classes: 'small', inputClasses: 'method-input', type: inputType, defaultValue: defaultValue}).dom);
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

      for (let input of this.dom.first().getElementsByTagName('input')) {
        if (!input.classList.contains('method-input')) continue;

        if (!input.checkValidity() || Number.isNaN(parseFloat(input.value))) {
          valid = false;
          continue;
        }
        inputs[input.id] = parseFloat(input.value);
      }

      document.getElementById(this.outputId).innerHTML = valid ? Utils.formatReal(this.computeCompute(inputs)) : "--";
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

      dom.on('input', () => this.update());

      container.append(dom);

      this.outputId = outputId;
      this.dom = dom;
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

      let defaultValue = ('defaultValue' in options) ? options.defaultValue : 0;
      this.min = ('min' in options) ? options.min : null;
      this.max = ('max' in options) ? options.max : null;

      let inputOptions = "";
      if (this.min != null) inputOptions += " min=" + this.min;
      if (this.max != null) inputOptions += " max=" + this.max;
      if (options.required) inputOptions += " required";

      let classes = 'scientific-input';
      if (options.classes) classes += ' ' + options.classes;

      let inputClasses = '';
      if (options.inputClasses) inputClasses = options.inputClasses;

      this.dom         = u(`<div class="scientific-input ${classes}">`);
      this.minusButton = u('<div class="bi bi-dash minus-button">');
      this.plusButton  = u('<div class="bi bi-plus plus-button">');
      this.input = u(`<input type='${this.allowExponents ? "text" : "number"}' class='${inputClasses}' step='any' ${inputOptions} inputmode='text' value=${defaultValue}>`);

      this.dom.append(this.minusButton);
      this.dom.append(this.input);
      this.dom.append(this.plusButton);

      if (options.inputId) this.input.first().id = options.inputId;
      if (options.container) u(options.container).append(this.dom);

      this.minusButton.on('click', () => {
        this.stepDown();
      });

      this.plusButton.on('click', () => {
        this.stepUp();
      });

      this.input.on('keydown', (e) => {
        if (e.key == 'ArrowUp' || e.key == 'ArrowDown') {
          if (e.key == 'ArrowUp') this.stepUp();
          if (e.key == 'ArrowDown') this.stepDown();
          e.preventDefault();
        }
      });

      this.input.on('input', (e) => {
        //if (!this.input.first().value.match(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]*)?$/)) {
        if (!this.input.first().value.match(/^[-+0-9.eE]*$/)) {
          this.input.first().value = this.lastRawValue;
          return;
        }

        this.lastRawValue = this.input.first().value;

        if (this.input.first().value.match(/^[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]*)?$/)) {
          this.input.first().setCustomValidity("");
        } else {
          this.input.first().setCustomValidity("invalid");
        }
        //this.input.first().value = this.input.first().value.replace(/[^0-9eE.]/, '');

        if (this.input.first().checkValidity()) {
          this.dom.addClass('valid');
          this.dom.removeClass('invalid');
        } else {
          this.dom.addClass('invalid');
          this.dom.removeClass('valid');
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
      this.input.first().value = formatReal(x, formatOptions);
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

  //u('h1').after(new ScientificInput({min: 0}).dom);

  class ComputeCalculator {
    static renderMethod1(container) {
      let method = new Method(container, 'Method 1: Counting the number of arithmetic operations');
      method.setFormula('compute = 2 × # of connections × 3 × # of training examples × # of epochs');
      method.addBlock('Number of connections', {info: 'For more information, click <a href="https://google.com">here</a>'});
      method.addBlock('Number of training examples');
      method.addBlock('Number of epochs');
      method.computeCompute = (inputs => 2 * inputs.numberOfConnections * 3 * inputs.numberOfTrainingExamples * inputs.numberOfEpochs);
      method.dom.trigger('input');
    }

    static renderMethod2(container) {
        let method = new Method(container, 'Method 2: Hardware details and usage');
        method.setFormula('compute = training time × # of cores × peak FLOP/s × utilization rate');

        method.dom.addClass('method2');

        // Custom time input block

        let timeBlock = u('<div>');
        timeBlock.append('<input id="trainingTime" type="hidden" class="method-input">');
        timeBlock.append('<input type="text" autocomplete="off" id="trainingTimeAmount" value="10d" class="small">');
        timeBlock.append('<select id="trainingTimeUnit" value="hour" style="display: none">');
        timeBlock.append('<span id="trainingTimeChecker" class="quiet-text" style="margin-left: 1em">');
        timeBlock.children('#trainingTimeUnit')
          .append('<option value="hour">Hours')
          .append('<option value="day" selected>Days')
          .append('<option value="year">Years');

        // Parse strings such as '20d', '1e40s' or '2 years'
        function parseTimeString(str) {
          str = str.replace(/[\s,]/g, '');
          let m = str.match(/^\s*(?<amount>\+?[0-9]*\.?[0-9]*(e[+-]?[0-9]*)?)\s*(?<unit>\w+)?$/i);

          let parseResult = null;

          if (m) {
            let amount = (m.groups.amount.length == 0) ? 0 : parseFloat(m.groups.amount);
            let unitStr = m.groups.unit || "hour";

            let unitToSeconds = {
              "years":  86400*365,
              "days":   86400,
              "hours":  3600,
              "seconds": 1,
            };

            let selectedUnit = null;
            for (let unit in unitToSeconds) {
              if (unit.startsWith(unitStr)) {
                selectedUnit = unit;
                break
              }
            }

            if (selectedUnit) {
              parseResult = {};
              parseResult.seconds = amount * unitToSeconds[selectedUnit];
              parseResult.str = `${Utils.formatReal(amount, 10000)} ${selectedUnit}`;
            }
          }

          return parseResult;
        }

        let trainingTimeAmount  = timeBlock.children('#trainingTimeAmount');
        let trainingTimeUnit    = timeBlock.children('#trainingTimeUnit');
        let trainingTime        = timeBlock.children('#trainingTime');
        let trainingTimeChecker = timeBlock.children('#trainingTimeChecker');

        [trainingTimeAmount, trainingTimeUnit].forEach(x => x.on('input', () => {
          let trainingTimeStr = trainingTimeAmount.first().value;
          let parseResult = parseTimeString(trainingTimeStr);
          if (parseResult) {
            trainingTime.first().value = parseResult.seconds;
            trainingTime.trigger('input', {target: trainingTime.first()});
            trainingTimeChecker.html('(' + parseResult.str + ')');
            trainingTimeAmount.first().setCustomValidity("");
            if (trainingTimeStr != "") {
              trainingTimeAmount.addClass("valid");
            } else {
              trainingTimeAmount.removeClass("valid");
            }
          } else {
            trainingTimeChecker.html('');
            trainingTimeAmount.first().setCustomValidity("invalid");
            trainingTimeAmount.removeClass("valid");
          }

          /*
          u('#trainingTime').first().value = 
              Utils.parseFloat(u('#trainingTimeAmount').first().value) *
              Utils.parseFloat(u('#trainingTimeUnit').first().value);
          u('#trainingTime').trigger('input', {target: u('#trainingTime').first()});
          */
        }));

        timeBlock.children('#trainingTimeAmount').trigger('input');

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
            <label for="peakFlopS" class="input-label">Peak FLOP/s</label>
            <!--
            <input id="peakFlopS" class="small method-input" type="number" min=0 required></input>
            -->
        `);
        peakFlopSInput.append(new ScientificInput({min: 0, inputId: 'peakFlopS', classes: 'small', inputClasses: 'method-input', required: true}).dom);

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
              <input id="hardwareType" autocomplete="off" placeholder="Select hardware" style="width: 100%">
            </div>
        `));

        let div = u('<div style="display: flex; align-items: center;">');
        hardwareContainer.append(div);

        div.append(u('<div class="input-wrapper" style="flex: 0 0 7em; margin-right: 0.5em;">').html(`
            <label for="hardwarePrecision" class="input-label">Precision</label>
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

        div.append(u('<div class="input-wrapper" style="flex: 1 0 10%">').html(`
            <span id="peakFlopSChecker" class="quiet-text" style="margin-top: 15px; min-width: 7em"></span>
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
            u("#peakFlopSChecker", flopSBlock.first()).html(`(${formatReal(+peakFlopSStr)} FLOP/s)`);
            u('#peakFlopS', peakFlopSInput.first()).first().value = formatReal(+peakFlopSStr);
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

      let flopsBlockInfo = `
        <p>Consult the hardware details database <a href="https://docs.google.com/spreadsheets/d/1iX9ltegY0Ba1ElaLXlxcEi-Je7Qdr1slXju2Ns9XXzg/edit#gid=0">here</a>.</p>
        <p>You can suggest changes or additions filling <a href="example.com">this form.</a></p>
      `;

      method.addBlock('Training time <span class="quiet-text">(e.g., <i>10h</i>, <i>20d</i>, <i>0.8y</i>)</span>', {block: timeBlock});
      method.addBlock('Number of cores', {defaultValue: 1, inputType: 'normal'});
      method.addBlock(peakFlopSTitle, {block: flopSBlock, info: flopsBlockInfo}).addClass('full-flex');
      method.addBlock('Utilization rate', {defaultValue: 33, min: 0, max: 100, units: '%', inputType: 'normal'});

      method.computeCompute = (inputs => {
        return inputs.trainingTime * inputs.numberOfCores * inputs.peakFlopS * inputs.utilizationRate/100;
      });

      method.update();
      method.dom.trigger('input');
    }
  }

  Papa.parse(hardwareDataUrl, {
    download: true,
    header: true,
    complete: function(result) {
      hardwareSheet = result.data;
      let strCmp = (a, b) => (a < b) ? -1 : (a > b) ? +1 : 0;
      hardwareSheet.sort((a, b) => strCmp(a["Name of the hardware"], b["Name of the hardware"]));
      let hardwareTypes = result.data.map(x => x["Name of the hardware"]);
      if (u('#hardwareType')) {
        makeDropdown(u('#hardwareType').first(), hardwareTypes);
      }
      updateResults();
    },
    error: function(result) {
      console.log("Oh, no, download error");
    },
  });

  return ComputeCalculator;
}
