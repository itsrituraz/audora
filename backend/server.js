const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
require('dotenv').config();
const app = require('./app');
const connectDB = require('./db/db');


connectDB();
const PORT = process.env.PORT || 3000;
app.listen(PORT,"0.0.0.0", () => {
  console.log(`Server is running on ${PORT}`);
})

module.exports = app;

