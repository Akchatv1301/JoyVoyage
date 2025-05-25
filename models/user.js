const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose'); //importing passport-local-mongoose for user authentication

const userSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema); //exporting User model