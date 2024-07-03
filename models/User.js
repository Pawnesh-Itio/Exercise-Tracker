const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const userSchema = new Schema({
    username:String
});

// Create model using the Scheme
const User = mongoose.model('User',userSchema);
module.exports = User;