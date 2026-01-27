const userServices = require('../services/userServices');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

async function signup(req, res){
    try{
        const name = req.body.name ? req.body.name : null;
        const email = req.body.email ? req.body.email : null;
        let password = req.body.password ? req.body.password : null;

        if(!name){
            return res.status(400).json({ error: "Name not provided" });
        }
        if(!email){
            return res.status(400).json({ error: "Email not provided" });
        }
        if(!password){
            return res.status(400).json({ error: "Password not provided" });
        }

        const saltRounds = 10;
        //generating a salt
        bcrypt.genSalt(saltRounds, (err, salt)=>{
            if(err){
                return res.status(403).json({error:'Error in user registration! '});
            }else{
                //generating the hash
                bcrypt.hash(password, salt, (err, hash)=>{
                    if(err){
                        return res.status(403).json({error:'Error in user registration! '});
                    }else{
                        password = hash;
                        userServices.createUser(name, email, password, res);
                    }
                })
            }
        })

    }catch(err){
        return res.status(400).json({ error: err.message });
    }
}

async function signin(req, res){
    try{
        const email = req.body.email ? req.body.email : null;
        const password = req.body.password ? req.body.password : null;

        if(!email){
            return res.status(400).json({ error: "Email not provided" });
        }
        if(!password){
            return res.status(400).json({ error: "Password not provided" });
        }

        const doc = await userServices.getUser(email);
        if(doc && doc.email){
            bcrypt.compare(password, doc.password, (err, result)=>{
                if(result == true){
                    //jwt token if the password matches
                    const token = jwt.sign({id:doc.id}, process.env.JWT_SECRET, {expiresIn: '60000'});
        
                    return res.status(200).json({
                        user:{
                        id:doc._id,
                        name:doc.name,
                        email:doc.email
                        },
                        message: "Login Successful",
                        accessToken: token
                    });

                }else if(result == false){
                    return res.status(404).json({message:'Invalid Password! '});
                }else{
                    return res.status(500).json({message:'Internal Server Error! ', err});
                }
            })
        }else{
            response.status(404).json({message:'Invalid Email Provided! '});
        }

    }catch(err){
        return res.status(400).json({ error: err.message });
    }
}

module.exports = {
    signup,
    signin,
    
}