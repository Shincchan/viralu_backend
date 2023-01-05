const express =require('express');
// const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 8000
const mongoose = require('mongoose');
const {MONGOURI} = require('./config/keys');

//setting up mongodb connection
mongoose.connect(MONGOURI,{
    useNewUrlParser:true,
    useUnifiedTopology:true
});
mongoose.connection.on('connected',()=>{
    console.log('connected to mongodb');
})
mongoose.connection.on('error',(err)=>{
    console.log('error in database',err);
})
// app.use(cors);
//requiring schema
require('./models/user');
require('./models/post');

//parsing data to json
app.use(express.json());

app.use(require('./routes/auth'));
app.use(require('./routes/post'));
app.use(require('./routes/user'));

if(process.env.NODE_ENV=="production"){
    
    const path = require('path')
    app.get("/",(req,res)=>{
        app.use(express.static(path.resolve(__dirname,'client','build')))
        res.sendFile(path.resolve(__dirname,'client','build','index.html'))
    })
}

app.listen(PORT,()=>{
    console.log("server is running on ", PORT);
})