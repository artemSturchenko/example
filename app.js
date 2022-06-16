//jshint esversion:9

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
let materialsArray = [];


const app = express();

app.use(bodyParser.urlencoded({
    extended: true
}));
app.set('view engine', 'ejs');
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/valuesDB', { useNewUrlParser: true });

const valueSchema = new mongoose.Schema({
    valueName: String,
    value: Number
});

const materialsSchema = new mongoose.Schema({
    materialsName: String,
    materialsValue: Number,
    sertiricateAvailability: String,
});

const consumptionSchema = new mongoose.Schema({
    name: String,
    consumption: Object
});

const equivalentsSchema = new mongoose.Schema({
    name: String,
    equivalent: String
});

const Value = new mongoose.model("Value", valueSchema);
const Material = new mongoose.model("Material", materialsSchema);
const Consumption = new mongoose.model('Consumption', consumptionSchema);
const Equivalent = new mongoose.model('Equivalent', equivalentsSchema);

app.get('/', (req, res) => {
    let cableNames = [];
    let currencyNames = [];
    Consumption.find({}, (err, result) => {
        result.forEach(el => {
            cableNames.push(el.name);
        });

        Value.find({}, (err, result1) => {
            result1.forEach(el => {
                currencyNames.push(el.valueName);
            });
            res.render("home", {
                resultToRender: cableNames,
                resultToRender2: currencyNames
            });
        });
    });
});



app.get('/setCurrency', (req, res) => {
    res.render("setCurrency");
});

app.post('/setCurrency', (req, res) => {
    Value.deleteMany({}, err => {
        if (err) {
            console.log(err);
        }
    });
    const array = Object.entries(req.body);
    array.forEach(el => {
        const value = new Value({
            valueName: el[0],
            value: parseFloat(el[1])
        });
        value.save();
    });
    res.redirect('/viewCurrency');
});

app.get('/viewCurrency', (req, res) => {
    Value.find({}, (err, result) => {
        if (!err) {
            res.render("viewCurrency", {
                resultToRender: result
            });
        } else {
            console.log(err);
        }
    });
});

app.get('/viewMaterials', (req, res) => {
    Material.find({}, (err, result) => {
        if (!err) {
            res.render("viewMaterials", {
                resultToRender: result
            });
        } else {
            console.log(err);
        }
    });
});

app.get('/setMaterials', (req, res) => {
    Material.find({}, (err, result) => {
        if (!err) {
            materialsArray = result;
            res.render('setMaterials', {
                resultToRender: materialsArray
            });
        } else {
        }
    });
});

app.post('/setMaterials', (req, res) => {
    const replacedValues = req.body.setupValue;
    for (let i = 0; i < replacedValues.length; i++) {
        if (replacedValues[i] != '') {
            materialsArray[i].materialsValue = parseFloat(replacedValues[i]);
        }
    }
    Material.deleteMany({}, err => {
        if (err) {
            console.log(err);
        }
    });
    materialsArray.forEach(el => {
        const value = new Material({
            materialsName: el.materialsName,
            materialsValue: parseFloat(el.materialsValue),
            sertiricateAvailability: el.sertiricateAvailability
        });
        value.save();
    });
    res.redirect('/viewMaterials');
});

app.post('/pricing', async (req, res) => {
    Consumption.find({ 'name': req.body.selectCable }, (err, result) => {
        let array = [];
        const value = result[0].consumption;
        const value2 = Object.entries(value);
        for (let i = 0; i < Object.keys(value).length; i++) {
            Equivalent.find({'name':value2[i][0]}, (err, result) => {
                const obj = {
                    name: result[0].equivalent,
                    value: value2[i][1]
                };
                array.push(obj);
            });
        }
        res.render('pricing', {
            currency: req.body.selectCurrency,
            cableName: req.body.selectCable
        });
    });

});

app.listen(3000, () => {
    console.log('Server is listening on port 3000!');
});