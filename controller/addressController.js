const Addresses = require('../models/addressModel')
const User=require('../models/userModel')



// add addresss


const loadAddAddress = async(req, res, next) => { 
    try {
        const returnPage = req.query.returnPage
        console.log("returnPage",returnPage);
        const user = req.session.user
        res.render('addAddress',{isLoggedIn : true, page:'Add Address', parentPage:'Profile',user, returnPage})
    } catch (error) {
        next(error)
    }
}



const postAddAddress = async(req, res, next) => {
    try {
        const userId = req.session.userId;
        const { name, email, mobile, town, state, country, zip, address } = req.body
        console.log(req.body);
        const returnPage = req.params.returnPage
        console.log("returnPage",returnPage);
        const newAddress = { userName: name, email, mobile, town, state, country, zip, address }

        const isUserHasAddress = await Addresses.findOne({userId:userId})
        console.log("isUserHasAddress",isUserHasAddress);
        if(isUserHasAddress){
          const has =  await Addresses.updateOne(
            {userId:userId},
                {
                    $addToSet:{
                       addresses : newAddress
                    }
                }
            );
         console.log("1",has)
            switch(returnPage){
                case 'profile': 
                    res.redirect('/profile')
                    break;
                case 'checkout':
                    res.redirect('/shoppingCart/proceedToCheckout')
                    break;
            }

        }else{
           const no = await new Addresses({
                userId,
                addresses :[ newAddress ]
            }).save()
          console.log("2",no);
            switch(returnPage){
                case 'profile': 
                    res.redirect('/profile')
                    break;
                case 'checkout':
                    res.redirect('/shoppingCart/proceedToCheckout')
                    break;
            }
        }

    } catch (error) {
        next(error)
    }
}

// editProfile

const loadEditAddress = async (req, res, next) => {
    try {
        const addressId = req.params.id;
        const userId = req.session.userId;
        console.log("Address ID:", addressId);
        console.log("User ID:", userId);
        const  returnPage  = 'profile';

        const addressData = await Addresses.findOne({ userId: userId });
        console.log("Address Data:", addressData);

        // Find the address with the matching _id in the addresses array
        const address = addressData.addresses.find(addr => addr._id.toString() === addressId);

        if (!address) {
            // Handle the case where the address with the given _id is not found
            return res.status(404).send("Address not found");
        }

        res.render('editAddress', { address, isLoggedIn: true, page: 'Profile', returnPage });
    } catch (error) {
        next(error);
    }
}



// updateProfile

const postEditAddress = async(req, res, next) => {
    try {
        const addressId = req.params.id;
        const userId = req.session.userId;
        const { name, email, mobile, town, state, country, zip, address } = req.body
        const { returnPage } = req.query


        await Addresses.updateOne(
            {userId, 'addresses._id':addressId},
            {
                $set:{
                    'addresses.$.userName': name,
                    'addresses.$.email': email,
                    'addresses.$.mobile': mobile,
                    'addresses.$.town': town,
                    'addresses.$.state': state,
                    'addresses.$.country': country,
                    'addresses.$.zip': zip,
                    'addresses.$.address': address
                }
            }

        )
        console.log(returnPage+('this is return page'));
        if(returnPage == 'profile'){
            res.redirect('/profile');
        }else if(returnPage == 'checkout'){
            res.redirect('/shoppingCart/proceedToCheckout')
        }
       
        
    } catch (error) {
        next(error)
    }
}



// delete address 


const deleteAddress = async(req, res, next) => {
    try {
        const addressId = req.params.id;
        const userId = req.session.userId;

        await Addresses.updateOne(
            {userId, 'addresses._id': addressId},
            {
                $pull:{
                    addresses : { _id: addressId }
                }
            }
        )
        res.redirect('/profile');

    } catch (error) {
        next(error)
    }
}



module.exports = {
    loadAddAddress,
    postAddAddress ,
    loadEditAddress,
    postEditAddress ,
    deleteAddress
}

