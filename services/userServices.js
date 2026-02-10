const User = require('../models/User');

async function createUser(name, email, password, res) {
    const userObj = {
        'name': name,
        'email': email,
        'password': password
    };

    const user = new User(userObj);
    const exists = await User.exists({
        email: email
    });

    if(!exists){
        await user.save();
        return res.status(201).json({
        message:'User successfully registered!',
        _id: userObj._id,
        });
    }
    return res.status(403).json({ message:'User Already Exists!'});
}

async function getUser(email){
    const userDoc = await User.findOne({
        email: email
    });
    
    return userDoc;
}

module.exports = {
    createUser,
    getUser,

}