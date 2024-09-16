const mongoose = require('mongoose');

const mongoose_uri = "mongodb+srv://jawwad:Growmore1@cluster0.bedgwkj.mongodb.net/windash_station?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(mongoose_uri)
.then(() => {
    console.log("[connection.js] MongoDB server is running");
}).catch((err) => {
    console.log("[connection.js] MongoDB server connection failed with error: [", err.errmsg, "]");
});