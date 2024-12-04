require('dotenv').config();
const { MongoClient, ServerApiVersion } = require('mongodb');

async function main(callback) {
    const URI = process.env.DB;
    const client = new MongoClient(URI,
        {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
            }
        });

    try {
        await client.connect();
        await callback(client);

    } catch (e) {
        console.error(e);
        throw new Error('Unable to Connect to Database')
    }
}
module.exports = main;