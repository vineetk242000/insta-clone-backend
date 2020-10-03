const mongoose = require("mongoose");




const connect = async function () {
    const uri = "mongodb+srv://vineetk242000:vineet001@cluster0.euiog.mongodb.net/User?retryWrites=true&w=majority"; // Will return DB URI 
    console.log(`Connecting to DB - uri: ${uri}`);
    return mongoose.connect(uri, {useNewUrlParser: true,useFindAndModify:false});
  };
  
  
  async function connectToDb () {
    try {
     const connected = await connect();
    } catch(e) {
     console.log('Error happend while connecting to the DB: ', e.message)
    }
  };

  module.export = connectToDb();