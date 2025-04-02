const mongoose = require("mongoose");

const connectDB = async () => {
    if (!mongoose.connection.readyState) {
        await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    }
};

// Prevent "Cannot overwrite model" error
const SiteSettings =
    mongoose.models.sitesettings ||
    mongoose.model("sitesettings", new mongoose.Schema({ site_off: Boolean }), "sitesettings");

exports.handler = async (event) => {
    console.log("Received request:", event);

    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Method Not Allowed" };
    }

    try {
        await connectDB();
        const { site_off } = JSON.parse(event.body);
        console.log("Parsed data:", site_off);

        await SiteSettings.updateOne({}, { site_off }, { upsert: true });
        console.log("Database updated successfully");

        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Updated successfully!" }),
        };
    } catch (error) {
        console.error("Error updating site status:", error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
