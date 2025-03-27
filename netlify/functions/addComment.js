const mongoose = require('mongoose');
const { MongoClient } = require('mongodb');

const addComment = async (event) => {
  const { postId, content, name } = JSON.parse(event.body);

  if (!postId || !content || !name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: "All fields are required" }),
    };
  }

  try {
    // Connect to MongoDB
    const client = await MongoClient.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const db = client.db('VocaDecksDB');
    const postsCollection = db.collection('posts');

    // Find the post by ID
    const post = await postsCollection.findOne({ _id: mongoose.Types.ObjectId(postId) });

    if (!post) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Post not found" }),
      };
    }

    // Add the comment to the post's comments array
    const newComment = { content, name, createdAt: new Date() };
    await postsCollection.updateOne(
      { _id: mongoose.Types.ObjectId(postId) },
      { $push: { comments: newComment } }
    );

    client.close();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Comment added successfully" }),
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};

exports.handler = addComment;
