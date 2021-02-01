const multer=require("multer");
const fs =require("fs");
const path=require('path');


const fileStorage=multer.diskStorage({
    destination:(req,file,cb)=>{
    cb(null,path.join(__dirname, '../uploads/'));
    },
    filename:(req,file,cb)=>{
      cb(null,new Date().toISOString().replace(/:/g, '-')+file.originalname);
    }
});
  
  
const fileFilter =(req,file,cb)=>{
    if(file.mimetype==='image/png'||
    file.mimetype==='image/jpg'||
    file.mimetype==='image/jpeg'){
      cb(null,true);
    }else{
      cb(null,false);
    }
}

const upload = multer({storage:fileStorage,fileFilter:fileFilter}).single('image');

module.exports = upload;