//Collection Structure
const { SchemaTypes } = require('mongoose');
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
    'name': {
        type: SchemaTypes.String,
        required: [true, "name not provided "],
        trim: true,
    },
    'email': {
        type: SchemaTypes.String,
        required: [true, "email not provided "],
        unique: [true, "email already exists "],
        lowercase: true,
        trim: true,
        validate: {
            validator: function (v) {
              return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: '{VALUE} is not a valid email! '
          }
    },
    'password': {
        type: SchemaTypes.String,
        required: true,
    },
    'role': {
        type: SchemaTypes.String,
        enum: ['user', 'admin'],
        default: 'user',
        required: true,
        lowercase: true,
    },
    'companyID': {
        type: SchemaTypes.ObjectId,
        ref: 'company',
        required: false,    
    }
});

const User = mongoose.model('user', userSchema);
module.exports = User;