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

        const { postId, type } = JSON.parse(event.body);
        console.log("Voting on post:", { postId, type });

        if (!postId || !type || (type !== "up" && type !== "down")) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Valid post ID and vote type are required." }),
            };
        }

        const post = await Post.findById(postId);
        if (!post) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: "Post not found." }),
            };
        }

        if (type === "up") {
            post.upvotes += 1;
        } else {
            post.downvotes += 1;
        }

        await post.save();

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Vote registered successfully!" }),
        };
    } catch (err) {
        console.error("Database error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to vote", error: err.message }),
        };
    }
};
