const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    userId:{type:String,unique:true},
    name:{type:String},
    email:{type:String},
    FormStatus:Boolean,
});

const UserModel = mongoose.model('User', UserSchema);
module.exports = UserModel;
