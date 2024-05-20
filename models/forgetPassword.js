import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';
const FPSchema= new mongoose.Schema({
    userId:ObjectId,
    isActive:Boolean
})

export const FP=mongoose.model('fp',FPSchema);