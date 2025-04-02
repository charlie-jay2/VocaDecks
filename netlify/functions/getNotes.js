const mongoose = require('mongoose');
const { Schema } = mongoose;

// Connect to the database (using your ENV MONGO_URL)
const connectToDatabase = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGO_URL);
};

// Define the schema for the notes collection (should match saveNotes.js)
const notesSchema = new Schema(
    {
        notesTitle: {
            type: String,
            required: true,
            unique: true,
        },
        notesContent: {
            type: String,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    },
    {
        collection: 'siteSettings', // explicitly use the same collection as saveNotes
    }
);

// Use existing model if already compiled
const Notes = mongoose.models.Notes || mongoose.model('Notes', notesSchema);

exports.handler = async (event, context) => {
    try {
        // This function should only respond to GET requests
        if (event.httpMethod !== 'GET') {
            return {
                statusCode: 405,
                body: JSON.stringify({ message: 'Method Not Allowed' }),
            };
        }

        await connectToDatabase();

        // Retrieve the most recent note (using createdAt descending)
        const latestNote = await Notes.findOne().sort({ createdAt: -1 }).exec();

        if (!latestNote) {
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'No notes found' }),
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                notestitle: latestNote.notesTitle,
                notescontent: latestNote.notesContent,
            }),
        };
    } catch (error) {
        console.error('Error retrieving notes:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: 'Server Error',
                error: error.message,
            }),
        };
    }
};
