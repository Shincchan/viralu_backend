const express =require('express');
const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model('User');
const requireLogin = require('../middlewares/requireLogin');
const Post = mongoose.model('Post');


//getting user and its posts
router.get('/user/:id',requireLogin,(req,res)=>{
    User.findOne({_id:req.params.id})
    .select("-password")
    .then(user=>{
        Post.find({postedBy:req.params.id})
        .populate("postedBy","_id name")
        .exec((err,posts)=>{
            if(err){
                return res.status(422).json({error:err});
            }
            res.json({user,posts});
        })
    }).catch(err=>{
        return res.status(404).json({error:"user not found"})
    })
})

//follwer/following
router.put('/follow',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.body.followId,{
        $push:{followers:req.user._id}
        
    },{
        new:true
    },(err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            User.findByIdAndUpdate(req.user._id,{
                $push:{followings:req.body.followId}
            },
                {
                    new:true
                }
            ).select("-password").then(result=>{
                res.json(result);
            }).catch(err=>{
                return res.status(404).json({error:"user not found"})
            })
        }
    })
})

router.put('/unfollow',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.body.unfollowId,{
        $pull:{followers:req.user._id}
        
    },{
        new:true
    },(err,result)=>{
        if(err){
            return res.status(422).json({error:err})
        }else{
            User.findByIdAndUpdate(req.user._id,{
                $pull:{followings:req.body.unfollowId}
            },
                {
                    new:true
                }
            ).select("-password").then(result=>{
                res.json(result);
            }).catch(err=>{
                return res.status(404).json({error:"user not found"})
            })
        }
    })
})

//updateing profile pic
router.put('/updateprofilepic',requireLogin,(req,res)=>{
    User.findByIdAndUpdate(req.user._id,{
        $set:{pic:req.body.pic}
    },{new:true},(err,result)=>{
        if(err){
            return res.status(422).json({error:"can't update"});
        }
        res.json(result)
    })
})

router.post('/searchusers',requireLogin,(req,res)=>{
    let userPattern = new RegExp('^' + req.body.query)
    User.find({name:{$regex:userPattern}})
    .select("_id name")
    .then(user=>{
        res.json({user})
    })
    .catch(err=>{
        console.log(err)
    })
})




module.exports=router;