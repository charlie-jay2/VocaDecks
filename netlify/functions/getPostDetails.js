const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

exports.handler = async (event, context) => {
    const { MONGO_URL } = process.env;

    try {
        // Connect to MongoDB and explicitly use VocaDecksDB
        await mongoose.connect(MONGO_URL, { useNewUrlParser: true, useUnifiedTopology: true });
        const db = mongoose.connection.useDb('VocaDecksDB');
        const postCollection = db.collection("ForumData");

        const { postId } = event.queryStringParameters;

        if (!postId) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Post ID is required." }),
            };
        }

        const post = await postCollection.findOne({ _id: new ObjectId(postId) });

        if (!post) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Post not found." }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(post),
        };

    } catch (err) {
        console.error("Database error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to fetch post details", error: err.message }),
        };
    }
};
