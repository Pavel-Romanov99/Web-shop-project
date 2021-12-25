const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
var fs = require("fs");
//in order to check if someone is logged in we use sessions
const session = require("express-session");
//we use flash for messages
const flash = require("connect-flash");
app.use(flash());

//we use multer to upload images when we are the admin
const multer = require("multer");

const storage = multer.diskStorage({
  //where the file is stored
  destination: function (req, file, cb) {
    cb(null, "./public/photos");
  },
  //whats the name of the stored file
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});
//set the custom storage options
const upload = multer({ storage: storage });
/////
const secret = process.env.SECRET || "notagoodsecret";

app.use(session({ secret: secret }));

//require ejs-mate for boilerplate and partials
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);

//parse form information
app.use(express.urlencoded({ extended: true }));

//set views folder and view engine to ejs
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

//set the public folder so the pc knows where the styles are
app.use("/public", express.static(path.join(__dirname, "public")));

//include and connect to the database
const User = require("./models/user");
const Product = require("./models/product");
const Item = require("./models/cart");

require("dotenv").config();
const dbURL = process.env.DB_URL || "mongodb://localhost:27017/genius-clothing";

//"mongodb://localhost:27017/genius-clothing"
mongoose
  .connect(dbURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log("error connecting to db", err);
  });

//we create global variables as middleware for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  next();
});

//check if a user is admin
const adminCheck = (req, res, next) => {
  if (req.session.username === "admin") {
    next();
  } else {
    res.redirect("/login");
  }
};

//routes
app.get("/", (req, res) => {
  const session_id = req.session.user_id;
  const admin = req.session.username;
  res.render("testhomepage", { session_id, admin });
});

app.get("/shop", async (req, res) => {
  const session_id = req.session.user_id;
  const admin = req.session.username;

  //find the list of items in the database and add them to the html page
  const products = await Product.find({})
    .then((items) => {
      res.render("shop", { session_id, admin, items });
    })
    .catch((err) => {
      console.log("error finding product items", err);
    });
});

app.get("/product/:id", async (req, res) => {
  const { id } = req.params;
  const session_id = req.session.user_id;
  const admin = req.session.username;

  //find the item you clicked on in the database and add it to the page so you can access it
  Product.findById(id, function (err, item) {
    if (err) {
      console.log("error finding product by id", err);
    } else {
      if (item) {
        res.render("product", { id, session_id, admin, item });
      }
    }
  });
});

//login / register routes
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  let errors = [];

  if (!username || !password) {
    errors.push({ msg: "You must fill in all fields" });
  }
  if (password.length < 6) {
    errors.push({ msg: "Password must be over 6 characters" });
  }

  if (errors.length > 0) {
    res.render("login", { errors });
  }

  User.findOne({ username: username }, (err, user) => {
    if (err) {
      console.log("error finding user");
    } else {
      if (!user) {
        res.send("Wrong username/password");
      } else {
        bcrypt.compare(password, user.password, function (err, result) {
          if (err) {
            console.log("error comparing passwords");
          } else {
            if (result) {
              req.session.user_id = user._id;
              req.session.username = username;
              res.redirect("/");
            } else {
              req.flash("error_msg", "Incorrect password");
              console.log("wrong password");
              res.redirect("/login");
            }
          }
        });
      }
    }
  });
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password, password2 } = req.body;

  let errors = [];

  if (!username || !password) {
    errors.push({ msg: "You must fill in all fields" });
  }
  if (password.length < 6) {
    errors.push({ msg: "Password must be over 6 characters" });
  }
  if (password !== password2) {
    errors.push({ msg: "Passwords do not match!" });
  }
  if (errors.length > 0) {
    return res.render("register", { errors });
  }

  //try to find a user with the same username
  User.findOne({ username: username }, (err, user) => {
    if (err) {
      console.log("error finding user", err);
    } else {
      //if there is one
      if (user) {
        errors.push({ msg: "Username is taken!" });
        res.render("register", { errors });
      } else {
        //if the username is not taken
        bcrypt.hash(password, 12, async (err, hash) => {
          if (err) {
            console.log("error hashing password", err);
            res.render("register");
          } else {
            //create a new user and save him to the database
            const user = new User({
              username: username,
              password: hash,
            });
            await user
              .save()
              .then(() => {
                req.flash("success_msg", "Successfully registered!");
                res.redirect("/login");
              })
              .catch((err) => {
                console.log("error saving user to db");
              });
          }
        });
      }
    }
  });
});
//logout route
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});

app.get("/admin", adminCheck, async (req, res) => {
  const session_id = req.session.user_id;
  const admin = req.session.username;

  const products = await Product.find({})
    .then((items) => {
      res.render("admin", { session_id, admin, items });
    })
    .catch((err) => {
      console.log("error finding product items", err);
    });
});

app.post("/stats", upload.single("uploaded_file"), async (req, res) => {
  // req.file is the name of your file in the form above, here 'uploaded_file'
  // req.body will hold the text fields, if there were any
  const { brand, price } = req.body;

  const imagePath = path.join("../public/photos/" + req.file.originalname);

  const product = await new Product({
    brand: brand,
    price: price,
    image: imagePath,
  });

  product
    .save()
    .then(() => {
      res.redirect("/admin");
    })
    .catch((err) => {
      console.log("error saving product to db");
    });
});

//delete and update prices of products
app.post("/delete/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id)
    .then(() => {
      res.redirect(req.get("referer"));
    })
    .catch((err) => {
      console.log("error deleting comment", err);
    });
});

app.post("/update/:id", async (req, res) => {
  const { price } = req.body;
  await Product.findByIdAndUpdate(req.params.id, { price: price })
    .then(() => {
      res.redirect(req.get("referer"));
    })
    .catch((err) => {
      console.log("error deleting comment", err);
    });
});

//cart route
app.get("/cart", (req, res) => {
  const session_id = req.session.user_id;
  const admin = req.session.username;
  let total_sum = 0;
  let num_items = 0;

  Item.find({ user_id: session_id }, function (err, items) {
    if (err) {
      console.log("error finding cart items in db");
    } else {
      if (items.length > 0) {
        items.forEach((item) => {
          total_sum += parseInt(item.price) * item.number;
          num_items += item.number;
        });

        res.render("cart", { session_id, admin, items, total_sum, num_items });
      } else {
        res.render("cart", { session_id, admin, items, total_sum, num_items });
      }
    }
  });
});

app.post("/addCart/:id", async (req, res) => {
  const user_id = req.session.user_id;
  const item_id = req.params.id;
  const { size, quantity } = req.body;

  if (size === "size" || size === undefined) {
    req.flash("error_msg", "Please fill in the size");
    res.redirect("/shop");
  }

  Product.findById(item_id, async function (err, item) {
    if (err) {
      console.log("error finding item in addCart", err);
    } else {
      if (item) {
        const brand = item.brand;
        const price = item.price;
        const image = item.image;

        const cartItem = new Item({
          brand: brand,
          price: price,
          image: image,
          size: size,
          number: quantity,
          user_id: user_id,
        });

        await cartItem
          .save()
          .then(() => {
            req.flash("success_msg", "Item added to cart");
            res.redirect("/shop");
          })
          .catch((err) => {
            console.log("error saving cart item to database", err);
          });
      } else {
        console.log("no such item");
      }
    }
  });
});

app.post("/removeItem/:id", async (req, res) => {
  const { id } = req.params;

  await Item.findByIdAndDelete(id)
    .then(() => {
      res.redirect(req.get("referer"));
    })
    .catch((err) => {
      console.log("error deleting cart item");
    });
});

const port = process.env.PORT || 3000;

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
