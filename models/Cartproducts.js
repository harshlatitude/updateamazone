const mongoose = require("mongoose");


const cartProducts = new mongoose.Schema({
    id:String,
    url:String,
    detailUrl:String,
    title:Object,
    price:Object,
    description:String,
    discount:String,
    tagline:String
});


const cartdata = new mongoose.model("cartdatas",cartProducts);

module.exports = cartdata;