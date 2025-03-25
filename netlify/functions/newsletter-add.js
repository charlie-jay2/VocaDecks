const mongoose = require("mongoose");

exports.handler = async (event, context) => {
    const data = JSON.parse(event.body);
    const { name, email } = data;

    if (!name || !email) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "Name and Email are required." }),
        };
    }

    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: 'VocaDecksDB',
        });

        const db = mongoose.connection;
        const signupsCollection = db.collection('newslettersignups');

        // Check if email already exists
        const existingSignup = await signupsCollection.findOne({ email });
        if (existingSignup) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Email is already registered." }),
            };
        }

        // Add new signup
        await signupsCollection.insertOne({ name, email });

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } catch (error) {
        console.error(error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    }
};
