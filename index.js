//Dependecies
const express = require('express');
const cors = require('cors');

//Configuration File Modules
require("dotenv").config();
require("./configs/mongodb");

//Configurations
const app = express();
const port = process.env.PORT || 5000;

//Express Configs
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({extended: true}));

app.use('/',require('./routers/userRouters')); //dynamic routing

const server = app.listen(port, (err) => {
    if(err){
        console.log('Server Crash'+ JSON.stringify(err));
    }else{
        console.log('Server running at ', server.address().port);
    }
})