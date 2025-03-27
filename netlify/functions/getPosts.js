const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        content: { type: String, required: true },
        createdBy: { type: String, required: true },
        upvotes: { type: Number, default: 0 },
        downvotes: { type: Number, default: 0 },
        comments: { type: Array, default: [] },
    },
    { timestamps: true }
);

// Explicitly specify the collection name in VocaDecksDB
const Post = mongoose.models.Post || mongoose.model("Post", postSchema, "ForumData");

exports.handler = async (event, context) => {
    const { MONGO_URL } = process.env;

    try {
        console.log("Connecting to MongoDB...");
        await mongoose.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            dbName: "VocaDecksDB", // Explicitly set the database name
        });
        console.log("Connected to MongoDB");

        const posts = await Post.find(); // Fetch all posts

        if (posts.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ message: "No posts available" }), // Send a message when no posts are found
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify(posts),
        };
    } catch (err) {
        console.error("Database error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to retrieve posts", error: err.message }),
        };
    }
};
