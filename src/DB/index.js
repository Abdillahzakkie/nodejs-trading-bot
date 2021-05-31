require('dotenv/config');
const mongoose = require('mongoose');

const URI = process.env.ConnectionURI;

const connectDB = async () => {
    try {
        await mongoose.connect(URI, {
            useCreateIndex: true,
            useNewUrlParser: true,
            useFindAndModify: true,
            useUnifiedTopology: true
        }, console.log("Database connected"));
    } catch (error) {
        return error;
    }
}

module.exports =  { connectDB }