const express = require('express');
const adminRoute = express()
const session  = require('express-session')
const config = require('../config/config')
const {randomUUID} = require('crypto')
const adminController = require('../controller/adminController')
const nocache = require('nocache')
const upload = require('../config/multer');
const userController = require('../controller/userController')
const orderController = require('../controller/orderController')
const productController = require('../controller/productController')
const categoryController = require('../controller/categoryController')
const couponController = require('../controller/couponController')
const offerController = require('../controller/offerController')
const { isAdminLoggedIn, isAdminLoggedOut } = require('../middleware/auth');
const { loadOrderSuccess } = require('../controller/orderController');
const adminModel = require('../models/adminModel');

adminRoute.use(nocache())

adminRoute.use(express.json());
adminRoute.use(express.urlencoded({extended:true}))
adminRoute.use(
    session({
        secret:randomUUID(),
        resave:false,
        saveUninitialized:true,
    })
)

// adminRoute.set('view engine','ejs')

adminRoute.set('views','./view/admin')
// const auth = require('../middleware/adminAuth')
// const {cache} = require('ejs');
// const categoryModel = require('../models/categoryModel');

// login

adminRoute.get('/login',isAdminLoggedOut,adminController.loadlogin);
adminRoute.post('/login',adminController.verifyLogin)
adminRoute.get('/logout' ,isAdminLoggedIn,adminController.logoutAdmin )

// adminRoute.use(isAdminLoggedIn)

// dashBoard

adminRoute.get('/dashboard',adminController.dashBoard)

// user Handling

adminRoute.get('/user',userController.userTab);
adminRoute.get('/users/block/:id',adminController.blockUser)

// product 

adminRoute.get('/products',productController.loadProduct)
adminRoute.get('/products/addProduct',productController.loadAddProduct)
adminRoute.post('/products/addProduct',upload.array('product',3),productController.addProductDetails)
adminRoute.get('/products/editProduct/:id',productController.loadEditProduct)
adminRoute.get('/products/deleteProduct/:id',productController.deleteProduct)
adminRoute.post('/products/editProduct',upload.array('product',3),productController.postEditProduct)

// category

adminRoute.get('/category',categoryController.loadCategories);
adminRoute.post('/categories',categoryController.addCategory);
adminRoute.post('/categories/edit',upload.single('categoryImage'),categoryController.editCategory)
adminRoute.get('/categories/list/:id',categoryController.listCategory)

// orederside

adminRoute.get('/ordersList',orderController.loadOrdersList)
adminRoute.get('/orderDetails/:orderId',orderController.loadAdminOrderDetails)
adminRoute.post('/changeOrderStatus',orderController.changeOrderStatus)
adminRoute.get('/cancelOrder/:orderId',orderController.cancelOrders)
adminRoute.get('/cancelSinglePrdt/:orderId/:pdtId',orderController.cancelSinglePdts)
adminRoute.get('/approveReturn/:orderId',orderController.approveReturn)
adminRoute.get('/approveReturnSinglePrdt/:orderId/:pdtId',orderController.approveReturnForSinglePdt)

// coupons 

adminRoute.get('/coupons',couponController.loadCoupons)
adminRoute.get('/coupons/addCoupon',couponController.loadAddCoupon)
adminRoute.post('/coupons/addCoupon',couponController.postAddCoupon)
adminRoute.get('/coupons/editCoupon/:couponId',couponController.loadEditCoupon)
adminRoute.post('/coupons/editCoupon/:couponId',couponController.postEditCoupon)
adminRoute.get('/coupons/cancelCoupon/:couponId',couponController.cancelCoupon)



// offer

adminRoute.get('/offers',offerController.loadOffer)
adminRoute.get('/offers/addOffer',offerController.loadAddOffer)
adminRoute.post('/offers/addOffer',offerController.postAddOffer)
adminRoute.get('/offers/editOffer/:offerId',offerController.loadEditOffer)
adminRoute.post('/offers/editOffer/:offerId',offerController.postEditOffer)
adminRoute.get('/offers/cancelOffer/:offerId',offerController.cancelOffer)
adminRoute.post('/applyOfferToProduct',productController.applyProductOffer)
adminRoute.post('/removeProductOffer/:productId',productController.removeProductOffer)
adminRoute.post('/applyOfferToCategory',categoryController.applyCategoryOffer)
adminRoute.post('/removeCategoryOffer/:catId',categoryController.removeCategoryOffer)















module.exports = adminRoute