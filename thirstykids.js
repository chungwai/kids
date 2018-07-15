"use strict";

var fluidController = (function () {

    var data = {
        fluids: [],
        weight: -1,
        dehydration: 0,
        sodiumLevel: -1,
        potassiumLevel: -1,
        maintanencePerDay: -1,
        infusionRate: -1,
        deficit: -1,
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
        
        initFluids: function () {
            var fluid1 = new Fluid('D5 + 1/2 NS', 'maintanence', 50, 77, 0);
            data.fluids.push(fluid1);
            var fluid2 = new Fluid('D5 + 1/2 NS + 20mmol/L KCl', 'maintanence', 50, 77, 20);
            data.fluids.push(fluid2);
            var fluid3 = new Fluid('3.3% Dextrose + 0.3% NaCl (2/3 and 1/3)', 'maintanence', 33, 51, 0);
            data.fluids.push(fluid3);
            console.log(data.fluids);
        },
        getFluids: function () {
            return data.fluids;
        },

        setInput: function(obj){
            data.weight = obj.weight;
            data.dehydration = obj.dehydration;
            data.sodiumLevel = obj.sodiumLevel;
            data.potassiumLevel = obj.potassiumLevel;
        },

        getRates: function () {
            return {
                weight: data.weight, 
                maintanencePerDay: data.maintanencePerDay,
                deficit: data.deficit,
                infusionRate: data.infusionRate,
            }
        },

        calcMaintanence: function () { // using Holliday-Segar Method
            
            if (data.weight <= 10) {
                data.maintanencePerDay = 100 * data.weight;
            } else if (data.weight <= 20) {
                data.maintanencePerDay = 1000 + (data.weight - 10) * 50;
            } else {
                data.maintanencePerDay = 1500 + (data.weight - 20) * 20;
            }
            
        },

        calcRates: function() {
            console.log(data.dehydration );
            data.deficit = data.dehydration * 10 * data.weight
            var volumePerDay = data.maintanencePerDay + data.deficit;
            data.infusionRate = Math.round(volumePerDay/24);
        }
    }

})();

var UIController = (function () {

    var DOMobj = {
        bodyWeight: document.getElementById('bodyWeight'),
        dehydration: document.getElementById('dehydration'),
        sodiumLevel: document.getElementById('sodium'),
        potassiumLevel: document.getElementById('potassium'),

        submitBtn: document.getElementById('submitBtn'),
        fluidsTable: document.getElementById('fluidsTable'),
        outputBox: document.getElementById('output')
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
        
        writeResults: function(){
            var output;

            output = '<p>Fluid maintenance (ml/day) = %maintanencePerDay%<br>Deficit (ml/day) = %deficit%<br>Infusion Rate (ml/hr) = %infusionRate%</p>';
            output = output.replace('%maintanencePerDay%', fluidController.getRates().maintanencePerDay);
            output = output.replace('%deficit%', fluidController.getRates().deficit);
            output = output.replace('%infusionRate%', fluidController.getRates().infusionRate);
            DOMobj.outputBox.innerHTML = output;
        },

        getInput: function() {
            return {
                weight: parseFloat(DOMobj.bodyWeight.value),
                dehydration: parseFloat(DOMobj.dehydration.value),
                sodiumLevel: parseFloat(DOMobj.sodiumLevel.value),
                potassiumLevel: parseFloat(DOMobj.potassiumLevel.value)
            };
        },
    }

})();



var controller = (function (fluidCtrl, UICtrl) {
    var DOMobj = UIController.getDOMobj();


    var setupEventListerners = function () {
        DOMobj.submitBtn.addEventListener('click', function() {
            var input = UIController.getInput();
            
            fluidController.setInput(input);
            fluidController.calcMaintanence();
            fluidController.calcRates();
            UIController.writeResults();
    
        });
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