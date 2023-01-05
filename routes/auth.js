const express =require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const bcrypt =require('bcryptjs');
const jwt = require('jsonwebtoken');
const {JWT_SECRET} = require('../config/keys');

router.post('/signup',  async (req,res)=>{
    const {name,email,password,pic} = req.body;
    try {
        if(!email || !password || !name){
            return res.status(422).json({error : "please enter all the fields"})
         }
         let user = await User.findOne({email:email});
         let userAgain = await User.findOne({name:name});
         if(user || userAgain){
             return res.status(422).json({error : "User already exists with that email or name"});
         }
         else{
            //generating salt
            const salt = await bcrypt.genSalt(10);
            //generating hashedPassword
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            user = new User({
                 email :email,
                 password:hashedPassword,
                 name:name,
                 pic
     
             })
             await user.save();
             res.status(200).json({message : "saved successfuly"});
         }
    } catch (error) {
        console.log(error);
    }
    
    
});

router.post('/signin',async (req,res)=>{
    const {email,password} = req.body;

    try {
        if(!email || !password){
            res.status(422).json({error : "please add email or password"});
        }
        const user = await User.findOne({email:email});

        if(!user){
            return res.status(404).json({error :"invalid credentials"})
        }else{
            const validPassword = await bcrypt.compare(
                req.body.password,
                user.password
              );
              if (!validPassword) {
                 return res.status(400).json({error : "invalid credentials"});
              } else {

                const token = jwt.sign({_id:user._id},JWT_SECRET);
                const {_id,name,email,followers,followings,pic} = user;

                res.status(200).json({token,user:{_id,name,email,followers,followings,pic}});
              }
        }


    } catch (error) {
       console.log(error);
    }
    
})

module.exports=router;