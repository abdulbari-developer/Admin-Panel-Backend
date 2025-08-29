import express from 'express'
import client from '../config.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import nodemailer from 'nodemailer'
dotenv.config()
const a_router = express.Router()
const database = client.db("Auth")
const users = database.collection('Users')



function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

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
            const hashedPassword = await bcrypt.hash(req.body.password, 10)
            const otp = generateOTP()
            const newUser = {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                age: req.body.age,
                email: email,
                password: hashedPassword,
                otp: otp,
                isVerified: false
            }
            const insertUser = await users.insertOne(newUser)

            if (!insertUser) {
                return res.send("Something went wrong while inserting")
            }
            let transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.PASSWORD_APP
                }
            })
            let mailOption = {
                from: process.env.EMAIL_USER,
                to: email,
                subject: "OTP Verification",
                text: `your OTP is ${otp}`
            }

            transporter.sendMail(mailOption, (err, info) => {
                if (err) {
                    return res.send({
                        status: 0,
                        message: "error sending OTP"
                    })
                }
                res.send("User registered successfully. Please verify OTP sent to email.")
            })

        }
    } catch (error) {
        res.send("something went wrong")
    }
})




a_router.post('/verifyOTP', async (req, res) => {
    try {
        let email = req.body.email.toLowerCase()
        let otp = req.body.otp
        const checkUser = await users.findOne({ email: email })
        if (!checkUser) {
            return res.send({
                status: 0,
                message: "User not found"
            })
        }
        if (checkUser.otp === otp) {
            const updateUser = await users.updateOne({ email: email }, { $set: { isVerified: true }, $unset: { otp: "" } })
            return res.send({
                status: 1,
                message: "OTP verified successfully! You can now login."
            })
        }
        else {
            return res.send({
                status: 0,
                message: "Invalid OTP"
            })
        }
    } catch (error) {
        res.send(error)
    }
})

a_router.post('/login', async (req, res) => {
    try {
        if (!req.body.email || !req.body.password) {
            return res.send({
                status: 0,
                message: "Email and Password is required"
            })
        }
        let email = req.body.email.toLowerCase()
        const emailFormat = /^[a-zA-Z0-9_.+]+(?<!^[0-9]*)@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
        if (!email.match(emailFormat)) {
            return res.send({
                status: 0,
                message: "email and password is incorrect"
            })
        }
        let user = await users.findOne({ email: email });
        if (!user) {
            return res.send({
                status: 0,
                message: "User is not registered"
            })
        }
        if (!user.isVerified) {
            return res.send({
                status: 0,
                message: "verify your email first"
            })
        }
        let checkPassword = await bcrypt.compare(req.body.password, user.password)
        if (!checkPassword) {
            return res.send({
                status: 0,
                message: "Email or Password is incorrect"
            })
        }

        let token = jwt.sign({
            email,
            firstName: user.firstName,
        }, process.env.SECRET_JWT_KEY, { expiresIn: "2h" })
        res.cookie("token", token, {
            httpOnly: true,
            secure: true
        })
        res.send({
            status: 1,
            message: "success",
            "token": token
        })


    } catch (error) {
        res.send(error)
    }
})
export default a_router