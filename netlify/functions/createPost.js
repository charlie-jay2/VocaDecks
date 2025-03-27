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

        const { title, content, createdBy } = JSON.parse(event.body);
        console.log("Received data:", { title, content, createdBy });

        if (!title || !content || !createdBy) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: "Title, content, and creator name are required." }),
            };
        }

        const newPost = new Post({
            title,
            content,
            createdBy,
        });

        const result = await newPost.save();
        console.log("Post saved:", result);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Post created successfully!" }),
        };
    } catch (err) {
        console.error("Database error:", err);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Failed to create post", error: err.message }),
        };
    }
};
