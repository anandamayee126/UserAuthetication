import express from 'express';
const router= express.Router();
import {User} from '../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import middleware from '../middlewares/auth.js';
import Brevo from '@getbrevo/brevo';
import dot_env from 'dotenv';
import {FP} from '../models/forgetPassword.js';
dot_env.config();
var userId="";
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
function tokenCreation(userId)
{
    return jwt.sign({userId:userId},'secretKey');
}
router.post('/login',async(req,res)=>{
    const email= req.body.email;
    const password= req.body.password;

    const exist_email= await User.find({email:email});         
    
    if(exist_email==null){
        res.json({success:false, status:404, message:"User not found .... Please signup first"});
    }
    else{
        userId= exist_email[0]._id;
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

router.post('/forgetPassword',middleware,async(req,res)=>{
    try{
        const rec_email = req.body.email;
        console.log(rec_email);
        const user = await User.find({email:rec_email});
        console.log(user);
        console.log(user[0]== null)
        if(user === null)
        {
            console.log("inside user === null");
            return res.status(404).json({success : false , msg :"Email not found"})
        }
        var defaultClient = Brevo.ApiClient.instance;
        var apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.API_KEY

        var apiInstance = new Brevo.TransactionalEmailsApi();

        const sender = { "email": "anandamayee.2000@gmail.com"}

        const reciever = [{
            "email":rec_email
        }]
        console.log("req.user._id",req.user._id);
        const newFp = await FP.create({userId:req.user._id,isActive:true});
        console.log("link",newFp);
        const response = await apiInstance.sendTransacEmail({
            sender,
            to : reciever,
            subject : 'testing',
            textContent: 'hello , this is a text content',
            htmlContent: '<p>Click the link to reset your password</p>'+
            `<a href="http://127.0.0.1:5500/frontend/resetPassword.html?reset=${newFp._id}">click here</a>`
        }) 
            return res.json({success : true , response});
        }catch(e){
            console.log(e)
            return res.status(500).json({success : false ,msg :"Internal server error"})
        }
})

router.post('/update-password/:resetId',middleware,async(req,res) => {  
    try{
        const id = req.params.resetId;
        const newPassword =req.body.newPassword;
    
        const resetUser= await FP.findById(id);
        const user_id= resetUser.userId;
        console.log("user_id",user_id);
        if(!(resetUser.isActive)) {
            return res.json({success : false ,msg :"Link has expired... Please try again"});
        }
        const hash=await bcrypt.hash(newPassword,10);

        await User.findOneAndUpdate({_id:user_id},{$set: {password : hash}});
        await FP.findOneAndUpdate({_id:id},{$set:{isActive : true}});


        return res.status(200).json({success:true,message:"Password updated successfully"});

    }
    catch (err) {
        console.log(err);
        return res.status(500).json({success: false, message: "Internal Server error"});
    }


})

router.get('/check-password-link/:resetId',async(req, res) => {
    try{
        const id=req.params.resetId;
        const find=await FP.find({_id:id});
        console.log("check",find[0].isActive);
        return res.json({isActive:find[0].isActive});
    }
    catch(err) {
        console.log(err);
        return res.status(500).json({success:false, message:"Internal server error!!"});
    }
})
export default router;