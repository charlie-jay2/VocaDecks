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

exports.handler = async () => {
    console.log("Received request for site status.");

    try {
        await connectDB();

        const settings = await SiteSettings.findOne();
        console.log("Database result:", settings);

        return {
            statusCode: 200,
            body: JSON.stringify({ site_off: settings ? settings.site_off : false }),
        };
    } catch (error) {
        console.error("Error retrieving site status:", error);
        return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
    }
};
