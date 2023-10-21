const mongoose =  require("mongoose")
mongoose.connect("mongodb+srv://niyazmuhammad688:OPXiTDUA356iH1X8@niyas.599xaps.mongodb.net/?retryWrites=true&w=majority")

const express = require("express")
require('dotenv').config()
const nocache = require("nocache")
const session = require('express-session')
const path = require("path")
const userRoute = require("./routes/userRoutes")
const adminRoute = require("./routes/adminRoutes")
const { err404, err500 } = require('./middleware/errorHandlers')
const PORT = process.env.PORT || 3000
const  app  = express()

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(nocache())
// app.use('/admin',adminRoute)
app.use(session({
    secret : 'gffff',
    resave:false,
    saveUninitialized :true,
    cookie : {maxAge:30*24*60*60*1000}

}))


app.set('view engine', 'ejs');

app.use('/static',express.static(path.join(__dirname,'public')))
app.use('/assets',express.static(path.join(__dirname,'/public/assets')))
app.use('/',userRoute)
app.use('/admin',adminRoute)

app.set('views','./view')

app.use(err404)
app.use(err500)
// app.use(routeDifferentiator)


app.listen(PORT,()=>console.log(`server is running at http://localhost:${PORT}/home`))