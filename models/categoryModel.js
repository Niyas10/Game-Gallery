const mongoose = require('mongoose')

const categoySchema = new mongoose.Schema({
    name:{
        type : String,
        required : true
    },
    image:{
        type : String,
    },
    isListed:{
        type: Boolean,
        default: true
    },
    offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Offers',
    }
    // sizes : {
    
},
{
    timestamps: true
});

module.exports = mongoose.model("Category",categoySchema);