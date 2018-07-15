"use strict";

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
            //data.maintanencePerDay = -1;
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
            createFluid('0.18% NaCl/4% Dextrose', 'maintanence', 40, 31, 0);
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
            DOMobj.maintanence.water.innerHTML = results.maintanence.water;
            DOMobj.maintanence.sodium.innerHTML = results.maintanence.sodium;
            DOMobj.maintanence.potassium.innerHTML = results.maintanence.potassium;
            DOMobj.deficit.water.innerHTML = results.deficit.water;
            DOMobj.deficit.sodium.innerHTML = results.deficit.sodium;
            DOMobj.deficit.potassium.innerHTML = results.deficit.potassium;
            DOMobj.bolus.water.innerHTML = results.bolus.water;
            DOMobj.bolus.sodium.innerHTML = results.bolus.sodium;
            DOMobj.total.water.innerHTML = results.total.water;
            DOMobj.total.sodium.innerHTML = results.total.sodium;
            DOMobj.total.potassium.innerHTML = results.total.potassium;
            DOMobj.infusionRate.innerHTML = Math.round(results.infusionRate);

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
            return {
                weight: parseFloat(DOMobj.bodyWeight.value),
                dehydration: parseFloat(DOMobj.dehydration.value),
                sodiumLevel: parseFloat(DOMobj.sodiumLevel.value),
                potassiumLevel: parseFloat(DOMobj.potassiumLevel.value),
                bolusVol: parseFloat(DOMobj.bolusVol.value),
            };
        },
    }

})();



var controller = (function (fluidCtrl, UICtrl) {
    var DOMobj = UIController.getDOMobj();

    var outputRequirements = function () {
        fluidController.initVar();
        var input = UIController.getInput();

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
        DOMobj.submitBtn.addEventListener('click', outputRequirements);
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