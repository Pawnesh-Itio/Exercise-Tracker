const mongoose = require('mongoose');
const { Schema } = require('mongoose');

let excerciseSchema = new Schema({
    userId:{ type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    description: String,
    duration: Number,
    date: String
});
// Create model by excercise schema
const Excercise = mongoose.model("Excercise",excerciseSchema);
module.exports= Excercise;
