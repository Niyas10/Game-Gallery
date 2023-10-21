const express = require("express")
const userController = require('../controller/userController')
const  productController = require('../controller/productController')
const addressController = require('../controller/addressController')
const orderController= require('../controller/orderController')
const couponContoller = require('../controller/couponController')
const {isUserLoggedIn, isUserLoggedOut ,isUserBlocked} = require('../middleware/auth')
const session = require('express-session');
const userRoutes = express()



// cart Wishlist count


userRoutes.use(async(req,res,next)=>{
    res.locals.cartCount=req.session.cartCount
    res.locals.wishCount = req.session.wishCount
    next()
})


userRoutes.set('views','view/user')
userRoutes.get("/home",userController.loadHome)

// view 

userRoutes.get("/signup",isUserLoggedOut,userController.getSignUp)
userRoutes.post("/signup",isUserLoggedOut,userController.postSignup)

// userRoutes.get("/verifyOtp",userController.otpVerificaton)
userRoutes.post('/postOtp',isUserLoggedOut,userController.postVerifyOtp)
userRoutes.get('/login',isUserLoggedOut,userController.loadLogin)
userRoutes.post("/login",isUserLoggedOut,userController.postLogin)
userRoutes.get('/logout',userController.userLogout)
userRoutes.get('/forgetPassword',userController.forgetPassword)

// shop

userRoutes.get('/shop',productController.loadShop)
userRoutes.get('/shop/productOverview/:id',productController.loadProductOverview);

// shoping cart


userRoutes.get('/shop/addToCart/:id',userController.addToCart)
userRoutes.put('/updateCart',userController.updateCart);
userRoutes.post('/shoppingCart/removeItem/:id',userController.removeCartItem)
userRoutes.get('/shoppingCart/proceedToCheckout',orderController.loadCheckout)
userRoutes.post('/shoppingCart/placeOrder',orderController.placeOrder)
userRoutes.get('/wishlist',userController.loadWishlist)
userRoutes.post('/addToWishlist/:productId',userController.addToWishlist)
userRoutes.get('/removeWishlistItem/:productId',userController.removeWishlistItem)




// order

userRoutes.get('/shoppingCart',isUserLoggedIn,productController.loadShoppingCart)

userRoutes.get('/profile/myOrders',orderController.loadMyOrders)
userRoutes.get('/viewOrderDetails/:orderId',orderController.loadViewOrderDetails)
userRoutes.get('/cancelOrder/:orderId',orderController.cancelOrder)
userRoutes.get('/cancelSinglePrdt/:orderId/:pdtId',orderController.cancelSinglePdt)
userRoutes.get('/orderSuccess',orderController.loadOrderSuccess)
userRoutes.get('/returnOrder/:orderId',orderController.returnOrder)
userRoutes.get('/returnSinglePrdt/:orderId/:pdtId',orderController.returnSinglePdt)
userRoutes.get('/downloadInvoice/:orderId',orderController.getInvoice)

// userProfile
userRoutes.get('/profile',userController.loadProfile)
userRoutes.get('/profile/edit',userController.loadEditProfile)
userRoutes.post('/profile/edit',userController.postEditProfile)
userRoutes.get('/profile/addaddress',addressController.loadAddAddress)
userRoutes.post('/profile/addaddress/:returnPage',addressController.postAddAddress)
userRoutes.get('/profile/editAddress/:id',addressController.loadEditAddress)
userRoutes.post('/profile/editAddress/:id',addressController.postEditAddress)
userRoutes.get('/profile/deleteAddress/:id',addressController.deleteAddress)
userRoutes.get('/profile/changePassword',userController.changePassword)
userRoutes.post('/profile/changePassword',userController.postChangePassword)


// wallet

userRoutes.get('/profile/walletHistory',userController.loadWalletHistory)
userRoutes.post('/verifyPayment',orderController.verifyPayment)
userRoutes.post('/profile/addMoneyToWallet/',userController.addMoneyToWallet)



// coupon

userRoutes.post('/applyCoupon',couponContoller.applyCoupon);
userRoutes.get('/removeCoupon',couponContoller.removeCoupon)




module.exports =userRoutes