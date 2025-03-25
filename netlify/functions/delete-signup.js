require('dotenv').config(); // Load environment variables
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Define the NewsletterSignup schema
const newsletterSignupSchema = new Schema({
    name: String,
    email: String,
});

// Use a try-catch block to ensure the model is defined only once
let NewsletterSignup;
try {
    NewsletterSignup = mongoose.model('NewsletterSignup');
} catch (error) {
    NewsletterSignup = mongoose.model('NewsletterSignup', newsletterSignupSchema);
}

exports.handler = async (event, context) => {
    const { id } = JSON.parse(event.body);

    if (!id) {
        return {
            statusCode: 400,
            body: JSON.stringify({ message: "ID is required" }),
        };
    }

    // Connect to MongoDB using Mongoose
    try {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        // Delete the signup with the provided id
        const result = await NewsletterSignup.deleteOne({ _id: id });

        if (result.deletedCount === 0) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Signup not found" }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ success: true }),
        };
    } catch (err) {
        console.error(err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal Server Error" }),
        };
    } finally {
        mongoose.connection.close(); // Close the connection after the operation
    }
};
