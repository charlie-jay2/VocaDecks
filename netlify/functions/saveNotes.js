const mongoose = require('mongoose');
const { Schema } = mongoose;

// Connect to the database (using your ENV MONGO_URL)
const connectToDatabase = async () => {
    if (mongoose.connections[0].readyState) return;
    await mongoose.connect(process.env.MONGO_URL);
};

// Define the schema for the notes collection
const notesSchema = new Schema(
    {
        notesTitle: {
            type: String,
            required: true,
            unique: true, // so that the same title is not duplicated
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
        collection: 'siteSettings', // explicitly use the collection 'siteSettings'
    }
);

// Use existing model if already compiled
const Notes = mongoose.models.Notes || mongoose.model('Notes', notesSchema);

exports.handler = async (event, context) => {
    try {
        await connectToDatabase();

        // Ensure the request is a POST and has a body
        if (event.httpMethod !== 'POST' || !event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Invalid request. Request must be POST with a valid body.' }),
            };
        }

        // Parse the request body as JSON
        const requestData = JSON.parse(event.body);

        // Validate the input data
        if (!requestData.notestitle || !requestData.notesdata) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Both notestitle and notesdata are required.' }),
            };
        }

        // Check for an existing note with the same title
        const existingNote = await Notes.findOne({ notesTitle: requestData.notestitle });

        if (existingNote) {
            // Update the existing note's content
            existingNote.notesContent = requestData.notesdata;
            // Optionally update the createdAt to now, if needed
            existingNote.createdAt = Date.now();
            await existingNote.save();
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Notes updated successfully!' }),
            };
        } else {
            // Create a new note if it doesn't exist
            const newNote = new Notes({
                notesTitle: requestData.notestitle,
                notesContent: requestData.notesdata,
            });

            await newNote.save();
            return {
                statusCode: 200,
                body: JSON.stringify({ message: 'Notes saved successfully!' }),
            };
        }
    } catch (error) {
        console.error('Error saving notes:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error', error: error.message }),
        };
    }
};
