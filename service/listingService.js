const Listing = require("../models/listing");
const Review = require("../models/review");

// ==================================================
// 1. Find listings from MongoDB
// ==================================================

const findListings = async (queryData) => {

  const filter = {};


  // ----------------------------------------------
  // Location
  // ----------------------------------------------

  if (queryData.location) {

    filter.location = {
      $regex: queryData.location,
      $options: "i",
    };
  }


  // ----------------------------------------------
  // Country
  // ----------------------------------------------

  if (queryData.country) {

    filter.country = {
      $regex: queryData.country,
      $options: "i",
    };
  }


  // ----------------------------------------------
  // Budget
  // ----------------------------------------------

  if (queryData.budget) {

    const priceFilter = {};


    if (
      queryData.budget.min !== null &&
      queryData.budget.min !== undefined
    ) {

      priceFilter.$gte = queryData.budget.min;
    }


    if (
      queryData.budget.max !== null &&
      queryData.budget.max !== undefined
    ) {

      priceFilter.$lte = queryData.budget.max;
    }


    if (Object.keys(priceFilter).length > 0) {

      filter.price = priceFilter;
    }
  }


  // ----------------------------------------------
  // Get listings
  // ----------------------------------------------

  let listings = await Listing.find(filter)
    .populate("reviews");


  // ----------------------------------------------
  // Calculate average rating
  // ----------------------------------------------

  let listingsWithRating = listings.map((listing) => {

    const ratings = (listing.reviews || [])
      .map((review) => review.rating)
      .filter(
        (rating) => typeof rating === "number"
      );


    let averageRating = 0;


    if (ratings.length > 0) {

      const totalRating = ratings.reduce(
        (sum, rating) => sum + rating,
        0
      );

      averageRating =
        totalRating / ratings.length;
    }


    return {
      listing,
      averageRating,
    };
  });


  // ----------------------------------------------
  // Sorting
  // ----------------------------------------------

  if (queryData.sortBy === "rating") {

    listingsWithRating.sort((a, b) => {
      return b.averageRating - a.averageRating;
    });

  } else if (
    queryData.sortBy === "price_low_to_high"
  ) {

    listingsWithRating.sort((a, b) => {
      return a.listing.price - b.listing.price;
    });

  } else if (
    queryData.sortBy === "price_high_to_low"
  ) {

    listingsWithRating.sort((a, b) => {
      return b.listing.price - a.listing.price;
    });
  }


  // ----------------------------------------------
  // Limit results
  // ----------------------------------------------

  listings = listingsWithRating
    .slice(0, 10)
    .map((item) => item.listing);


  return listings;
};


// ==================================================
// 2. Create context for Gemini
// ==================================================

const createListingContext = (listings) => {

  return listings.map((listing) => {

    const ratings = (listing.reviews || [])
      .map((review) => review.rating)
      .filter(
        (rating) => typeof rating === "number"
      );


    let averageRating = null;


    if (ratings.length > 0) {

      const totalRating = ratings.reduce(
        (sum, rating) => sum + rating,
        0
      );

      averageRating = Number(
        (totalRating / ratings.length).toFixed(1)
      );
    }


    return {
      id: listing._id,
      title: listing.title,
      description: listing.description,
      price: listing.price,
      location: listing.location,
      country: listing.country,
      averageRating,
      reviewCount: ratings.length,
    };
  });
};


module.exports = {
  findListings,
  createListingContext,
};