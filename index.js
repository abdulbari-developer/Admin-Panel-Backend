import express from 'express'
import client from './config.js'
import { router } from './routes/userRoutes.js'
import p_router from './routes/productRoutes.js'
import a_router from './routes/authRoutes.js'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import cookieParser  from 'cookie-parser'

dotenv.config() 
const app = express()
const port = 5000



client.connect()

console.log("user seccessfully connected to mongodb")


app.use(express.json())
app.use(cookieParser())
app.use('/auth', a_router)

app.use((req, res, next) => {
    try {
       const decoded = jwt.verify(req.cookies.token , process.env.SECRET_JWT_KEY)
       console.log(decoded)
       next()
    } catch(error){
    return res.send({
      status : 0,
      error : error,
      message : "Invalid Token"
    })
  }
})

app.use('/admin', router)
app.use('/admin', p_router)


app.listen(port, () => {
    console.log("server run successfully")
})