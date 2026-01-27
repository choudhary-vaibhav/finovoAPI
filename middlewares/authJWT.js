const jwt = require('jsonwebtoken');
const userServices = require('../services/userServices');

const verifyToken = (request, response, next) => {
    //if the request has the data of authorization header and then checking if it is JWT
    if(request.headers && request.headers.authorization && request.headers.authorization.split(' ')[0] === 'JWT'){
        jwt.verify(request.headers.authorization.split(' ')[1], process.env.JWT_SECRET, (err, decode) =>{
            if(err){
                response.status(500).json({message:'Internal Server Error! ', err});
            }else{
                promise = userServices.findById(decode.id);
                promise.then(result=>{
                    if(result){
                        next(); //move to the controller
                    }else{
                        response.status(404).json({message:'User does not exists'});
                    }
                }).catch(err=>{
                    response.status(500).json({message:'Some DB Error! ', err});
                })    
            }
        })
    }else{
        response.status(403).json({message:'Invalid JWT Token'});
    }
}

module.exports = verifyToken;