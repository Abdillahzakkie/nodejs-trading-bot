require('dotenv/config');
const express = require('express');
const { connectDB } = require('./DB');
const { getNewPairEvents } = require('./helper');

const app = express();

const PORT = process.env.PORT || 8000;
app.use(express.json());

app.listen(PORT, async () => {
    console.log(`Server listening on PORT: ${PORT}`);
    await connectDB();
    await getNewPairEvents();
})