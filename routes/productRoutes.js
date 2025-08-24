import express from 'express'
import client from '../config.js'
import {database} from './userRoutes.js'
import { ObjectId } from 'mongodb'
const p_router = express.Router()
const products = database.collection("products")


p_router.post('/addProduct',async(req,res)=>{
    try {
        if(!req.body.name||!req.body.description||!req.body.price||!req.body.quantity){
            return res.send("fill out all the fields")
        }
        const newProduct = {
            name : req.body.name,
            description: req.body.description,
            price:req.body.price,
            quantity:req.body.quantity
        }
        const result = await products.insertOne(newProduct)
        if(result){
            return res.send("product added successfully")
        }
    } catch (error) {
        res.send("product not added")
    }
})


p_router.get('/allProducts',async (req,res)=>{
    try{ 
    const allProducts = await products.find().toArray();
    if(allProducts){
       return res.send(allProducts)
    }}catch(error){
       return res.send("something went wrong")
    }
})

p_router.put('/productUpdate', async(req,res)=>{
    try {
        const query = {_id: new ObjectId("68a8548a0529deaf73a0d574")}
        const update = {$set:{
            name:req.body.name,
            description:req.body.description,
            price: req.body.price,
            quanitiy: req.body.quanitiy
        } }
        const option ={}
        const updated = await products.updateOne(query,update,option);
        if(updated){
           return res.send("product updated successfully")
        }
    } catch (error) {
        return res.send("something went wrong while updating")
    }
})


p_router.delete('/deleteProduct',async(req,res)=>{
    try {
        const query = {_id: new ObjectId("68a8548a0529deaf73a0d574")}
        const result = await products.deleteOne(query)
        if (result) {
            res.send('Product Deleted successfully')
        }
    } catch (error) {
        res.send("something went wrong while deleting")
    }
})
export default p_router