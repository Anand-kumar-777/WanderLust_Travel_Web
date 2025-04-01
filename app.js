const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Listing = require('./models/listing'); // Import Listing model
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');

const app = express();
const port = 8080;
const Mongo_URL = 'mongodb://127.0.0.1:27017/wanderlust'; // MongoDB Connection URL

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.use(methodOverride('_method')); // Method Override

// Setting up EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname,"/public")));

// MongoDB Connection
async function main() {
  try {
    await mongoose.connect(Mongo_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("MongoDB Connection Error:", error);
  }
}
main();

// Home Route - Redirect to Listings
app.get("/", (req, res) => {
  res.redirect("/listing");
});

// Index Route - Show All Listings
app.get('/listings', async (req, res) => {
  try {
    const allListings = await Listing.find({});
    res.render("listings/index", { allListings });
  } catch (error) {
    res.status(500).send("Error fetching listings");
  }
});

// New Route - Form to Create New Listing
app.get('/listings/new', (req, res) => {
  res.render("listings/new");
});

// Show Route - Show a Specific Listing
app.get('/listings/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    if (!listing) {
      return res.status(404).send("Listing not found");
    }
    res.render("listings/show", { listing });
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

//Create route
app.post('/listings', async (req, res) => {
  let newListing=new Listing(req.body.listing);
  newListing=await newListing.save();
  res.redirect(`/listings`);
});

//Edit Route
app.get('/listings/:id/edit', async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/edit", { listing });
}
);

//Update Route
app.put('/listings/:id', async (req, res) => {
  let { id } = req.params;
  const listing = await Listing.findByIdAndUpdate(id,{...req.body.listing});
  res.redirect(`/listings`);
});

app.delete('/listings/:id', async (req, res) => {
  let { id } = req.params;
  let deletedListing = await Listing.findByIdAndDelete(id);
  console.log(deletedListing);
  res.redirect(`/listings`);
});

// Start the Server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
