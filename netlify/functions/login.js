const { MongoClient } = require("mongodb");

exports.handler = async function (event, context) {
    const { username, password } = JSON.parse(event.body);
    const client = new MongoClient(process.env.MONGO_URL);
    const sessionDuration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    try {
        // Ensure the connection string is valid and being passed correctly
        if (!process.env.MONGO_URL) {
            return {
                statusCode: 500,
                body: JSON.stringify({ success: false, message: "MongoDB connection string is not defined." }),
            };
        }

        await client.connect();
        const db = client.db("VocaDecksDB");
        const logindata = db.collection("logindata");
        const sessions = db.collection("sessions");

        // Query the collection for username and password directly (not nested under _id)
        const user = await logindata.findOne({ username, password });

        if (user) {
            // Create a session and store the IP address
            const ip = event.headers["x-forwarded-for"] || event.headers["remote-addr"];

            // Delete expired sessions older than 24 hours
            await sessions.deleteMany({ createdAt: { $lt: new Date(Date.now() - sessionDuration) } });

            // Create a new session
            const session = {
                username,
                ip,
                createdAt: new Date(),
                expiresAt: new Date(Date.now() + sessionDuration), // session expires in 24 hours
            };

            await sessions.insertOne(session);

            return {
                statusCode: 200,
                body: JSON.stringify({ success: true, message: "Login successful" }),
            };
        } else {
            return {
                statusCode: 400,
                body: JSON.stringify({ success: false, message: "Invalid credentials" }),
            };
        }
    } catch (error) {
        console.error("Error:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ success: false, message: "Internal server error" }),
        };
    } finally {
        await client.close();
    }
};
