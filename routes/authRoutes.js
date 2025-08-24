import express from 'express'
import client from '../config.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
const a_router = express.Router()
const database = client.db("Auth")
const users = database.collection('Users')


a_router.post('/register', async (req, res, next) => {
    try {
        if (!req.body.firstName || !req.body.lastName || !req.body.age || !req.body.email || !req.body.password) {
            return res.send("Fill out all the fields")
        } else {
            const email = req.body.email.toLowerCase()
            const emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
            const passwordValidation = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/;
            if (!email.match(emailFormat)) {
                return res.send("fill correct email pattern ")
            }
            if (!req.body.password.match(passwordValidation)) {
                return res.send("fill correct password pattern")
            }
            const checkUser = await users.findOne({ email: email })
            if (checkUser) {
                return res.send("email already exist ")
            }
            const hashedPassword = await bcrypt.hash(req.body.password,10)
            const newUser = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                age: req.body.age,
                email: email,
                password: hashedPassword
            }
            const insertUser = await users.insertOne(newUser)
            if (insertUser) {
                res.send("User registered successfully")
            }
        }
    } catch (error) {
        res.send("something went wrong")
    }
})





a_router.post('/login',async(req,res)=>{
    try {
        if (!req.body.email || !req.body.password) {
            return res.send({
                status:0,
                message:"Email and Password is required"
            })
        }
        let email = req.body.email.toLowerCase()
        const emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if(!email.match(emailFormat)){
            return res.send({
                 status:0,
                 message:"email and password is incorrect"
            })
        }
        let user = await users.findOne({email : email});
        if(!user){
            return res.send({
                status:0,
                message:"User is not registered"
            })
        }
        let checkPassword = await bcrypt.compare(req.body.password , user.password)
        if (!checkPassword) {
             return res.send({
        status :0 ,
        message : "Email or Password is incorrect"
      }) 
        }

        let token = jwt.sign({
            email,
            firstName: user.firstName,
        },process.env.SECRET_JWT_KEY,{expiresIn:"2h"})
        res.cookie("token",token,{
            httpOnly:true,
            secure:true
        })
        res.send({
            status:1,
            message:"success",
            "token": token
        })
        

    } catch (error) {
        res.send(error)
    }
})
export default a_router