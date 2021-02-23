const mongoose = require("mongoose");




const connect = async function () {
    const uri = "Your Mongodb Url"; // Will return DB URI 
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