const express =require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Post = mongoose.model('Post');
const requireLogin = require('../middlewares/requireLogin');

//creating a post
router.post('/createpost',requireLogin,(req,res)=>{
    const {title , body , pic } = req.body;
    if(!title || !body ||!pic){
        return res.status(422).json({error: "please enter all the fields"});
    }
    req.user.password = undefined;
    const post = new Post({
        title,
        body,
        photo : pic,
        postedBy : req.user
    })
    post.save().then(result=>{
        res.json({post:result});
    })
    .catch(err=>{
        console.log(err);
    })
})

//getting all posts
router.get('/allpost',requireLogin,(req,res)=>{
    Post.find()
    .populate('postedBy',"_id name pic")
    .populate("comments.postedBy","_id name")//getting only id and name
    .sort('-createdAt') //sorting in descending order
    .then(posts=>{
        res.json({posts});
    })
    .catch(err=>{
        console.log(err);
    })
})

//logged in users posts
router.get('/mypost',requireLogin,(req,res)=>{
    Post.find({postedBy:req.user._id})
    .populate("postedBy","_id name pic")
    .sort('-createdAt')
    .then(myPost=>{
        res.json({myPost})
    })
    .catch(err=>{
        console.log(err);
    })
})


//getting followers post 
router.get('/followingpost',requireLogin,(req,res)=>{
    Post.find({postedBy:{$in:req.user.followings}})
    .populate("postedBy","_id name pic")
    .populate("comments.postedBy","_id name")
    .sort('-createdAt') 
    .then(posts=>{
        res.json({posts})
    })
    .catch(err=>{
        console.log(err);
    })
})


//like of a post
router.put('/like',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $push:{likes:req.user._id}
    },{
        new:true
    })
    .populate("comments.postedBy","_id name")
    .populate('postedBy',"_id name pic")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err});
        }
        else{
            res.json(result);;
        }
    })
})

//unlike a post
router.put('/unlike',requireLogin,(req,res)=>{
    Post.findByIdAndUpdate(req.body.postId,{
        $pull:{likes:req.user._id}
    },{
        new:true
    })
    .populate("comments.postedBy","_id name")
    .populate('postedBy',"_id name pic")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err});
        }
        else{
            res.json(result);;
        }
    })
})
//comment on a post
router.put('/comment',requireLogin,(req,res)=>{

    const comment = {
        text : req.body.text,
        postedBy : req.user._id,
    }

    Post.findByIdAndUpdate(req.body.postId,{
        $push:{comments:comment}
    },{
        new:true
    })
    .populate("comments.postedBy","_id name")
    .populate('postedBy',"_id name pic")
    .exec((err,result)=>{
        if(err){
            return res.status(422).json({error:err});
        }
        else{
            res.json(result);
        }
    })
})
//deleting a post
router.delete('/deletepost/:postId',requireLogin,(req,res)=>{
    Post.findOne({_id:req.params.postId})
    .populate("postedBy","_id")
    .exec((err,post)=>{
        if(err || !post){
            return res.status(422).json({error:err})
        }

        if(post.postedBy._id.toString()===req.user._id.toString()){
            post.remove()
            .then(result=>{
                res.json(result)
            })
            .catch(err=>{
                console.log(err);
            })
        }
    })
})
//deleting a comment
router.delete('/deletecomment/:postId/:commentId',requireLogin,(req,res)=>{
    
    Post.findOne({_id:req.params.postId}).populate("comments.postedBy","_id").populate("postedBy","_id")
    .then(post=>{
    if(!post){
        return res.status(422).json({error:"not found"})
    }
    if(post.postedBy._id.toString()===req.user._id.toString()){
        
        Post.findByIdAndUpdate(req.params.postId,{
            $pull:{comments:{_id:req.params.commentId}}
        },{
            new:true
        })
        .populate("comments.postedBy","_id name")
        .populate('postedBy',"_id name pic")
        .exec((err,result)=>{
           if(err){
               return res.json({error:err});
           }
           
          return res.json(result);
        })
    }else{
        comment = post.comments.filter(item=>{
            return item._id.toString() === req.params.commentId.toString() && item.postedBy._id.toString() === req.user._id.toString()
        });
       
        Post.findByIdAndUpdate(req.params.postId,{
            $pull:{comments:comment[0]}
        },{
            new:true
        })
        .populate("comments.postedBy","_id name")
        .populate('postedBy',"_id name pic")
        .exec((err,result)=>{
            if(err || !result){
                return res.status(422).json({error:err})
            }
            else{
                    res.json(result)
            }
        
        })
            
}
})
    
})
module.exports = router;