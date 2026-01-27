const express = require('express');
const userRouter = express.Router();
const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/authJWT');

// sign in and sign up
userRouter.post('/api/user/signin', userController.signin);
userRouter.post('/api/user/signup', userController.signup);


module.exports = userRouter;