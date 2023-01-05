const mongoose =require('mongoose');
const {ObjectId} =  mongoose.Schema.Types

const userSchema = new mongoose.Schema({
    name:{
        type : String,
        required : true,
        unique : true,
    },
    email:{
        type : String,
        required : true,
        unique: true,
    },
    password :{
        type:String,
        required: true,
    },
    pic:{
        type:String,
        default:"https://res.cloudinary.com/udirai/image/upload/v1649409283/2_img_au1jq7.jpg"
    },

    followers:[{type:ObjectId,ref:'User'}],
    
    followings:[{type:ObjectId,ref:'User'}],


},{timestamps:true});
mongoose.model('User',userSchema);