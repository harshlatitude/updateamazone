const express = require("express");
const router = new express.Router();
const products = require("../models/productsSchema");
const User = require("../models/userSchema");
const bcrypt = require("bcryptjs");
const authenicate = require("../middleware/authenticate");
const cartdata = require("../models/Cartproducts");

// router.get("/",(req,res)=>{
//     res.send("this is testing routes");
// });


// get the products data

router.get("/getproducts", async (req, res) => {
    
    try {
        const producstdata = await products.find();
        // console.log(producstdata + "data mila hain");
        res.status(201).json(producstdata);
    } catch (error) {
        console.log("error" + error.message);
    }
});


// register the data
router.post("/register", async (req, res) => {
    // console.log(req.body);
    const { fname, email, mobile, password, cpassword } = req.body;

    if (!fname || !email || !mobile || !password || !cpassword) {
        res.status(422).json({ error: "filll the all details" });
        console.log("bhai nathi present badhi details");
    };

    try {

        const preuser = await User.findOne({ email: email });

        if (preuser) {
            res.status(422).json({ error: "This email is already exist" });
        } else if (password !== cpassword) {
            res.status(422).json({ error: "password are not matching" });;
        } else {

            const finaluser = new User({
                fname, email, mobile, password, cpassword
            });

            // yaha pe hasing krenge

            const storedata = await finaluser.save();
            // console.log(storedata + "user successfully added");
            res.status(201).json(storedata);
        }

    } catch (error) {
        console.log("error the bhai catch ma for registratoin time" + error.message);
        res.status(422).send(error);
    }

});



// login data
router.post("/login", async (req, res) => {
    // console.log(req.body);
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400).json({ error: "fill the details" });
    }

    try {

        const userlogin = await User.findOne({ email: email });
        console.log(userlogin);
        if (userlogin) {
            const isMatch = await bcrypt.compare(password, userlogin.password);
            console.log(isMatch);



            if (!isMatch) {
                res.status(400).json({ error: "invalid crediential pass" });
            } else {

                const token = await userlogin.generatAuthtoken();
                console.log(token);

                res.cookie("eccomerce", token, {
                    expires: new Date(Date.now() + 2589000),
                    httpOnly: true
                });
                res.status(201).json(userlogin);
            }

        } else {
            res.status(400).json({ error: "user not exist" });
        }

    } catch (error) {
        res.status(400).json({ error: "invalid crediential pass" });
        console.log("error the bhai catch ma for login time" + error.message);
    }
});

// getindividual

router.get("/getproductsone/:id", async (req, res) => {

    try {
        const { id } = req.params;
        console.log(id);

        const individual = await products.findOne({ id: id });
        // console.log(individual + "ind mila hai");

        res.status(201).json(individual);
    } catch (error) {
        res.status(400).json(error);
    }
});


// adding the data into cart
router.post("/addcart/:id", authenicate, async (req, res) => {

    try {
        console.log("perfect 6");
        const { id } = req.params;
        const cart = await products.findOne({ id: id });

        const Usercontact = await User.findOne({ _id: req.userID });
        // console.log(Usercontact + "user milta hain");`

        if (cart) {
            const usercart = new cartdata({
                id: cart.id,
                url: cart.ur,
                detailUrl: cart.detailUrl,
                title: cart.title,
                price: cart.price,
                description: cart.description,
                discount: cart.discount,
                tagline: cart.tagline
            })
            usercart.save()

            if (usercart._id) {

                const cartData = await Usercontact.addcartdata(usercart._id);
                res.status(201).json(cartData);
            } else {
                console.log("else part")
            }


        }
    } catch (error) {
        console.log(error);
    }
});
// _id: req.userID

// get data into the cart
router.get("/cartdetails", authenicate, async (req, res) => {
    try {

        const buyuser = await User.aggregate([{ $lookup: { from: "cartdatas", localField: "carts", foreignField: "_id", as: "cartdata" } }]);
        // console.log( "user hain buy pr",buyuser);
        res.status(201).json(buyuser);
    } catch (error) {
        console.log(error + "error for buy now");
    }
});



// get user is login or not
router.get("/validuser", authenicate, async (req, res) => {
    try {
        const validuserone = await User.findOne({ _id: req.userID });
        // console.log(validuserone + "user hain home k header main pr");
        res.status(201).json(validuserone);
    } catch (error) {
        console.log(error + "error for valid user");
    }
});

// for userlogout

router.get("/logout", authenicate, async (req, res) => {
    try {
        req.rootUser.tokens = req.rootUser.tokens.filter((curelem) => {
            return curelem.token !== req.token
        });

        res.clearCookie("eccomerce", { path: "/" });
        req.rootUser.save();
        res.status(201).json(req.rootUser.tokens);
        console.log("user logout");

    } catch (error) {
        console.log(error + "jwt provide then logout");
    }
});

// item remove ho rhi hain lekin api delete use krna batter hoga
// remove iteam from the cart
router.get("/remove/:id", authenicate, async (req, res) => {
    try {
        const { id } = req.params;

        await cartdata.findByIdAndDelete({ _id: id });

        req.rootUser.carts = req.rootUser.carts.filter((curel) => {
            return curel != id
        });

        req.rootUser.save();

        res.status(201).json(req.rootUser);


    } catch (error) {
        console.log(error + "jwt provide then remove");
        res.status(400).json(error);
    }
});


module.exports = router;