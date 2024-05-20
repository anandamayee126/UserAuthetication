import express from 'express';
const app= express();
import cors from 'cors';
import User from './routes/user.js';
import mongoose from 'mongoose';
let mongoConnect= await mongoose.connect('mongodb+srv://ghoshanandamayee:LL4W9mIpbWEZHeok@cluster0.mfihvdl.mongodb.net/');
// console.log("connected",mongoConnect);

app.use(cors());
app.use(express.json());
app.use('/user',User);

app.listen(4000,()=>{
    console.log("mongoose connected");
})