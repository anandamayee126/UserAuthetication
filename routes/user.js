import express from 'express';
const router= express.Router();
import {User} from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

router.post('/signup',async(req,res) => {
    const name= req.body.name;
    const email= req.body.email;
    console.log("email",email);
    const password= req.body.password;
    const exist= await User.find({email:email});    
    console.log(exist)
    if(exist==[]){
        res.json({success: false,message:'already exists'});
    }
    else{
        const saltRounds=10;
        bcrypt.hash(password, saltRounds,async(err,hash) => {
            
        console.log(err);
        const newUser= User.create({name:name,email:email,password:hash});
        console.log("new user",newUser);                     
        res.json({success: true,message:'new user registered'});
       })
    }
})

router.post('/login',async(req,res)=>{
    const email= req.body.email;
    const password= req.body.password;

    const exist_email= await User.find({email:email});         
    
    if(exist_email==null){
        res.json({success:false, status:404, message:"User not found .... Please signup first"});
    }
    else{
        bcrypt.compare(password,exist_email[0].password,(err,result)=>{        
            if(err){
                res.json({success:false,message:"Something went wrong"});
            }
            else if(result===true){
                return res.json({success:true,message:"User login successfull",token:tokenCreation(userId)});
            }
            else{
                res.status(403).json({success:false,message:"incorrect password"});
            }
        })
    }
})

function tokenCreation(userId)
{
    return jwt.sign({userId:userId},'secretKey');
}
export default router;