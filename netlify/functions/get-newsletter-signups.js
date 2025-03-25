const mongoose = require("mongoose");

exports.handler = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'VocaDecksDB',
        });

        const db = mongoose.connection;
        const signupsCollection = db.collection('newslettersignups');

        // Fetch all newsletter signups
        const signups = await signupsCollection.find().toArray();

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true, signups }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error fetching signups." }),
        };
    }
};
