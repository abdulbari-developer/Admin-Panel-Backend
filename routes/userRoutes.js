import express from 'express'
import client from '../config.js'
import { ObjectId } from 'mongodb'
import a_router from './authRoutes.js'

export const router = express.Router()
export const database = client.db("adminPanel")
const users = database.collection("users")


router.post('/addUser',async (req,res)=>{
  try{
    // res.json("hello")
    if(!req.body.firstName ||!req.body.lastName ||!req.body.age ||!req.body.email ||!req.body.phone ){
        return res.send("fill out all the fields")
    }
    const email = req.body.email.toLowerCase();
    const phone = req.body.phone;
    const emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    const phoneValidation = /^\+(?<cc>\d{1,3})[ -]?\d{3}[ -]?\d{3}[ -]?\d{4}$/;
    if(!email.match(emailFormat)){
        return res.send("email is invalid")
    }
    if(!phone.match(phoneValidation)){
       return res.send("phone number is invalid")
    }
     const checkUser = await Users.findOne({ email: email })
      if (checkUser) {
        return res.send('Email already exist')
      }

    const user = {
        firstName : req.body.firstName,
        lastName : req.body.lastName,
        age : req.body.age,
        email : email,
        phone : phone,
    }
    const response =await users.insertOne(user);
    if(response){
    return res.send('user add successfully')
}
  }catch(error){
      console.log(error)

  }
})


router.get('/users',async (req,res)=>{
    try{
        const allUsers= await users.find().toArray() 
        return res.send(allUsers)
    }catch(error){
        console.error(error)
    }
})

router.put('/updateUser',async (req,res)=>{
    try{
      const query = {lastName : "Bari"};
//       const check = await users.findOne(query)
//       if(check){
//    console.log("correct")
//       }
      const update = {$set :{
        firstName:req.body.firstName,
        lastName:req.body.lastName,
        age:req.body.age,
        email:req.body.email,
        phone: req.body.phone

      }};
      const option ={upsert: false};
      const updatedUser = await users.updateOne(query, update, option)
    //   const user = await users.find()
 res.send({
      message: "User updated successfully",
      result: updatedUser
    });
    console.log(updatedUser)
    }catch(error){
        console.error(error)
    }
})

router.delete('/deleteUser',async (req,res)=>{
    try{
        const query = {_id:new ObjectId("68a444a2cff22fdba2a0d54b")}
        const result = await users.deleteOne(query);
        if(result){
           return res.send("user deleted")
        }
    }catch(error){
      return res.send(error)
    }
})


