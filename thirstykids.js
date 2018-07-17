"use strict";

var myMath = (function () {
    return {
        round: function (num, decimal) {
            return Math.round((num + 0.00001) * Math.pow(10, decimal)) / Math.pow(10, decimal);
        }
    }
}());

var fluidController = (function () {

    var data = {
        fluids: [],
        weight: -1,
        dehydration: 0,
        sodiumLevel: -1,
        potassiumLevel: -1,
        //maintanencePerDay: -1,
        infusionRate: 0,
        maintanence: {
            water: 0,
            sodium: 0,
            potassium: 0,
        },
        deficit: {
            water: 0,
            sodium: 0,
            potassium: 0,
        },
        bolus: {
            water: 0,
            sodium: 0,
        },
        total: {
            water: 0,
            sodium: 0,
            potassium: 0,
        }
    };

    var Fluid = function (name, use, dextrose, sodium, potassium) {
        //dextrose in g/L, sodium in mmol/L, potassium in mmol/L,
        this.name = name;
        this.use = use;
        this.dextrose = dextrose;
        this.sodium = sodium;
        this.potassium = potassium;
    };

    return {

        initVar: function () {
            data.weight = - 1;
            data.dehydration = 0;
            data.sodiumLevel = -1;
            data.potassiumLevel = -1;
            data.maintanence.water = 0;
            data.bolus.water = 0;
            data.infusionRate = -1;
        },

        initFluids: function () {
            var fluid;
            var createFluid = function (...arg) {
                fluid = new Fluid(...arg);
                data.fluids.push(fluid);
            };
            createFluid('D5 + ½ NS', 'maintanence', 50, 77, 0);
            createFluid('D5 + ½ NS + 40mmol/L KCl', 'maintanence', 50, 77, 40);
            createFluid('⅓solution (3.3% Dextrose + 0.3% NaCl)', 'maintanence', 33, 51, 0);
            createFluid('½:½', 'maintanence', 25, 77, 0);
            createFluid('5.85% NaCl', 'supplement', 0, 1001, 0);
            createFluid('1/5 solution: NaCl 0.18% + Dextrose 4.3%', 'maintanence', 43, 31, 0);
        },

        getFluids: function () {
            return data.fluids;
        },

        setInput: function (obj) {
            data.weight = obj.weight;
            data.dehydration = obj.dehydration;
            data.sodiumLevel = obj.sodiumLevel;
            data.potassiumLevel = obj.potassiumLevel;
            data.bolus.water = obj.bolusVol;
            data.bolus.sodium = data.bolus.water * 154 / 1000;
        },

        getResults: function () {
            return {
                maintanence: data.maintanence,
                deficit: data.deficit,
                bolus: data.bolus,
                total: data.total,
                infusionRate: data.infusionRate,
            }
        },

        calcMaintanence: function () { // using Holliday-Segar Method
            if (data.weight <= 10) {
                data.maintanence.water = 100 * data.weight;
            } else if (data.weight <= 20) {
                data.maintanence.water = 1000 + (data.weight - 10) * 50;
            } else {
                data.maintanence.water = 1500 + (data.weight - 20) * 20;
            };
            data.maintanence.sodium = 3 * data.weight;
            data.maintanence.potassium = 2 * data.weight;
        },

        calcDeficit: function () {
            data.deficit.water = data.weight * data.dehydration * 10;
            data.deficit.sodium = data.deficit.water * 84 / 1000;
            data.deficit.potassium = data.deficit.water * 60 / 1000;
        },


        calcTotal: function () {
            data.total.water = data.maintanence.water + data.deficit.water - data.bolus.water;
            data.total.sodium = data.maintanence.sodium + data.deficit.sodium - data.bolus.sodium;
            data.total.potassium = data.maintanence.potassium + data.deficit.potassium;
        },

        calcRates: function () {
            data.infusionRate = data.total.water / 24;
            //var volumePerDay = data.maintanence.water + data.deficit.;
            //data.infusionRate = Math.round(volumePerDay / 24);
        },
    }

})();

var UIController = (function () {

    var DOMobj = {
        bodyWeight: document.getElementById('bodyWeight'),
        dehydration: document.getElementById('dehydration'),
        sodiumLevel: document.getElementById('sodium'),
        potassiumLevel: document.getElementById('potassium'),
        bolusVol: document.getElementById('bolusVol'),

        submitBtn: document.getElementById('submitBtn'),
        fluidsTable: document.getElementById('fluidsTable'),
        infusionRate: document.getElementById('infusionRate'),
        patientInput: document.getElementById('patientInputDiv'),

        requirementResult: document.getElementById('requirementResult'),
        requirementError: document.getElementById('requirementError'),
        deficitRow: document.getElementById('deficitRow'),
        bolusRow: document.getElementById('bolusRow'),
        totalRow: document.getElementById('totalRow'),


        maintanence: {
            water: document.getElementById('maintenanceWater'),
            sodium: document.getElementById('maintenanceSodium'),
            potassium: document.getElementById('maintenancePotassium'),
        },
        deficit: {
            water: document.getElementById('deficitWater'),
            sodium: document.getElementById('deficitSodium'),
            potassium: document.getElementById('deficitPotassium'),
        },
        bolus: {
            water: document.getElementById('bolusWater'),
            sodium: document.getElementById('bolusSodium'),
            potassium: document.getElementById('bolusPotassium'),
        },
        total: {
            water: document.getElementById('totalWater'),
            sodium: document.getElementById('totalSodium'),
            potassium: document.getElementById('totalPotassium'),
        }
    }

    var fluids = fluidController.getFluids();

    return {
        getDOMobj: function () {
            return DOMobj;
        },
        writeFluidTable: function () {
            var header = '<thead><tr><th>Fluid</th><th>Dextrose (g/L)</th><th>Na+ (mmol/L)</th><th>K+ (mmol/L)</th><th>Use</th></tr></thead>';
            DOMobj.fluidsTable.innerHTML = header + '<tbody>';
            fluids.forEach(function (el) {
                var HTMLstring;
                HTMLstring = '<tr><td>%name%</td><td>%dextrose%</td><td>%sodium%</td><td>%potassium%</td><td>%use%</td></tr>';
                HTMLstring = HTMLstring.replace('%name%', el.name);
                HTMLstring = HTMLstring.replace('%dextrose%', el.dextrose);
                HTMLstring = HTMLstring.replace('%sodium%', el.sodium);
                HTMLstring = HTMLstring.replace('%potassium%', el.potassium);
                HTMLstring = HTMLstring.replace('%use%', el.use);
                DOMobj.fluidsTable.innerHTML += HTMLstring;
            });
            DOMobj.fluidsTable.innerHTML += '</tbody>';
        },


        writeResults: function () {
            var results = fluidController.getResults();
            DOMobj.maintanence.water.innerHTML = myMath.round(results.maintanence.water, 1);
            DOMobj.maintanence.sodium.innerHTML = myMath.round(results.maintanence.sodium, 1);
            DOMobj.maintanence.potassium.innerHTML = myMath.round(results.maintanence.potassium, 1);
            DOMobj.deficit.water.innerHTML = myMath.round(results.deficit.water, 1);
            DOMobj.deficit.sodium.innerHTML = myMath.round(results.deficit.sodium, 1);
            DOMobj.deficit.potassium.innerHTML = myMath.round(results.deficit.potassium, 1);
            DOMobj.bolus.water.innerHTML = myMath.round(results.bolus.water, 1);
            DOMobj.bolus.sodium.innerHTML = myMath.round(results.bolus.sodium, 1);
            DOMobj.total.water.innerHTML = myMath.round(results.total.water, 1);
            DOMobj.total.sodium.innerHTML = myMath.round(results.total.sodium, 1);
            DOMobj.total.potassium.innerHTML = myMath.round(results.total.potassium, 1);
            DOMobj.infusionRate.innerHTML = myMath.round(results.infusionRate, 0);

            /* 
            var output;
            output = '<p>Fluid maintenance (ml/day) = %maintanencePerDay%<br>Deficit (ml/day) = %deficit%<br>Infusion Rate (ml/hr) = %infusionRate%</p>';
            output = output.replace('%maintanencePerDay%', fluidController.getRates().maintanencePerDay);
            output = output.replace('%deficit%', fluidController.getRates().deficit);
            output = output.replace('%infusionRate%', fluidController.getRates().infusionRate);
            DOMobj.outputBox.innerHTML = output;
            */
        },


        getInput: function () {
            var validated = true;
            var errorMsg = new Array();
            var weight, dehydration, sodiumLevel, potassiumLevel, bolusVol;

            var inputToNum = function (input, min, max, allowEqual, optional, varName, defaultValue) {
                if (optional && input == '') {
                    return defaultValue;
                } else if (isNaN(parseFloat(input))) {
                    errorMsg.push(varName + ' has to be a number');
                } else if (allowEqual && (parseFloat(input) < min || parseFloat(input) > max)) {
                    errorMsg.push('Please make sure ' + min + ' <= ' + varName + ' <= ' + max);
                } else if (!allowEqual && (parseFloat(input) <= min || parseFloat(input) >= max)) {
                    errorMsg.push('Please make sure ' + min + ' < ' + varName + ' < ' + max);
                } else {
                    return parseFloat(input);
                }
                return defaultValue;
            };

            weight = inputToNum(DOMobj.bodyWeight.value, 0, 60, false, false, 'Weight', 0);
            dehydration = inputToNum(DOMobj.dehydration.value, 0, 30, true, true, '%Dehydration', 0);
            sodiumLevel = inputToNum(DOMobj.sodiumLevel.value, 100, 180, true, true, 'Sodium level', 0);
            potassiumLevel = inputToNum(DOMobj.potassiumLevel.value, 1, 8, true, true, 'Potassium level', 0);
            bolusVol = inputToNum(DOMobj.bolusVol.value, 0, 2500, true, true, 'Bolus Volume', 0);

            //console.log(DOMobj.dehydration.value);
            //console.log(isInputValid(DOMobj.dehydration.value, 0, 40, true, true));
            //console.log(valueIsNaN(DOMobj.dehydration.value));
            //console.log(isNaN(DOMobj.dehydration.value));
            //console.log(DOMobj.dehydration.value > 0);
            return {
                errorMsg, weight, dehydration, sodiumLevel, potassiumLevel, bolusVol
            };
        },

        visibilityCtrl: function (errorMsg, dehydration, bolusVol) {
            console.log(errorMsg.length);
            var errorHTMLstring;
            if (errorMsg.length >= 1) {
                errorHTMLstring = 'Errors:<ul>';
                errorMsg.forEach(function (e) {
                    errorHTMLstring += ('<li>' + e + '</li>');
                });
                errorHTMLstring += '</ul>';
                console.log(errorHTMLstring);
                DOMobj.requirementResult.classList.add('inactive');
                DOMobj.requirementError.classList.remove('inactive');
                DOMobj.requirementError.innerHTML = errorHTMLstring;
            } else {
                DOMobj.requirementResult.classList.remove('inactive');
                DOMobj.requirementError.classList.add('inactive');
            }
            (dehydration === 0) ? DOMobj.deficitRow.classList.add('inactive') : DOMobj.deficitRow.classList.remove('inactive');
            (bolusVol === 0) ? DOMobj.bolusRow.classList.add('inactive') : DOMobj.bolusRow.classList.remove('inactive');
            ((dehydration === 0) && (bolusVol === 0)) ? DOMobj.totalRow.classList.add('inactive') : DOMobj.totalRow.classList.remove('inactive');
        },
    }

})();



var controller = (function (fluidCtrl, UICtrl) {
    //var firstRunRequirement = true;
    var DOMobj = UIController.getDOMobj();

    var outputRequirement = function () {
        fluidController.initVar();
        var input = UIController.getInput();

        UIController.visibilityCtrl(input.errorMsg, input.dehydration, input.bolusVol);

        fluidController.setInput(input);
        fluidController.calcMaintanence();
        // if (!isNaN(DOMobj.dehydration)) {
        fluidController.calcDeficit();
        //}
        fluidController.calcTotal();
        fluidController.calcRates();
        UIController.writeResults();
    };

    var setupEventListerners = function () {
        DOMobj.submitBtn.addEventListener('click', outputRequirement);
        //DOMobj.patientInput.addEventListener('keypress', calculateNeeds);
    }

    return {
        init: function () {
            console.log('Thirsty Kids is made by Dr. Wong Chung Wai, William.');
            console.log('He works in the paediatric department of Pamela Youde Nethersole Eastern Hospital, HK.');
            setupEventListerners();
            fluidController.initFluids();
            UIController.writeFluidTable();
        }
    }
})(fluidController, UIController);

controller.init();