//FHIR model
//app/models/fhir.js

var mongoose = require('mongoose');

//Schema for coding, which is a part of FHIR model
var codingSchema = mongoose.Schema({
    system     : String,
    code       : String,
    display    : String
},{ _id : false });
var Coding = mongoose.model('Coding', codingSchema);

//Schema for category, which is also a part of FHIR model
var categorySchema = mongoose.Schema({
    coding     : [codingSchema],
    text       : String
},{ _id : false });
var Category = mongoose.model('Category', categorySchema);

//Schema for our FHIR model
var fhirSchema = mongoose.Schema({
    resourceType     : String,
    id               : String,
    meta             : {
        profile      : Array
    },
    status           : String,
    issued           : Date,
    category         : [categorySchema],
    code             : {
        coding       : [codingSchema]
    },
    subject          : {
        reference    : String
    },
    effectiveDateTime: Date,
    valueQuantity    : {
        value        : Number,
        unit         : String,
        system       : String,
        code         : String
    }
}, {versionKey : false});
var FHIR = mongoose.model('FHIR', fhirSchema);

// create the model for FHIR and expose it to our app
// module.exports = mongoose.model('FHIR', fhirSchema);
module.exports = {
    Coding : Coding,
    Category : Category,
    FHIR : FHIR
}