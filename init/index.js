const mongoose = require("mongoose");
const initData = require("./data.js"); //initData is an object exported by data.js {data : sampleListings}
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/JoyVoyage";
main()
    .then(() => console.log("Connected to DB"))
    .catch(err => console.log(err));

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({}); //deleting already existing data
    
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "6834856dd67146673bf2c54c",
    })); //adding owner id to each listing object 

    await Listing.insertMany(initData.data); //inserting new data
    console.log("data was initialized");
};

initDB(); //calling the function