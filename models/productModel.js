const mongoose = require('mongoose')

const productsSchema = mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },price: {
        type: Number,
        required: true
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    
    quantity: {
        type: Number
    },
    images: {
        type: Array,
        required: true
    },
    offerType: {
        type: String,
        enum: ['Offers', 'BrandOffers'],
        required: function(){
            this.offer !== ''
        }
    },

    offer:{
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'offerType'
    },
    offerPrice: { type: Number },
    offerAppliedBy: { 
        type: String
    },
    isListed: {
        type : Boolean,
        default: true
    },

  

    
},
{
timestamps:true,
})


module.exports = mongoose.model('Products',productsSchema)