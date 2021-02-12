const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const connectToDb = require ("./utility/db")
const cors=require("cors");
const path = require("path")
const uploadFile = require("./middlewares/fileUpload")
const {login,registerUser} = require("./controllers/auth");
const {createPost,deletePost, explore ,savePost, unsavePost, getPosts, getSavedPosts, addComments, getFeed, likePost, unLikePost} = require("./controllers/post");
const {followUser,unfollowUser, editUserProfile, searchUser, getUser, getSuggestions, getFollowers, getFollowedUsers} = require("./controllers/user")




connectToDb;

app.use(
  bodyParser.urlencoded({
    extended: false
  })
);


app.use(bodyParser.json());

app.use(uploadFile); 
app.use(express.static(path.join(__dirname, 'uploads')));
app.use(cors());
app.use(express.json());


app.get("/image/:file",(req,res)=>{
  let file = req.params.file;
  let fileLocation=path.join(__dirname,'uploads',file);
  res.sendFile(`${fileLocation}`);
});



app.get("/",(req,res)=>{
    res.send("server is up");
})


// Register new User 

app.post("/register",registerUser);


//  logging in User

app.post("/login",login);


// Get dashboard of the user

app.get("/getUser/:userId/:reqUser",getUser);


// Create a new Post. Pass UserId, caption,file as body parameters

app.post("/createPost",createPost);

// Route to delete a post, pass the post id and userId as a parameter to perform the task.

app.get("/deletePost/:postId/:userId",deletePost);

// Route for following User. Here currentUserId= Logged In UserId and userId = UserId of the account to follow

app.get("/follow/:currentUserId/:userId",followUser);



// Route to unfollow a user

app.get("/unfollow/:currentUserId/:userId",unfollowUser);

// Route to edit logged in User Profile. **Pass in previous values of fields as body parameters even if
// user doesnt want to update certain fields

app.get("/getFollowers/:userId",getFollowers);

app.get("/getFollowedUsers/:userId",getFollowedUsers);

app.post("/editUserProfile",editUserProfile);


//Route to get posts for explore section

app.get('/explore',explore);


// Route to show logged in user suggestions of accounts to follow

app.get('/suggestions/:userId',getSuggestions);

// Search users by passing userName as param

app.get('/search/:userName',searchUser);


app.get("/getposts/:userId",getPosts);


app.get("/likePost/:postId/:userId",likePost);

app.get("/unlikePost/:postId/:userId",unLikePost);

// Route to save a post to user Account

app.get("/savepost/:postId/:userId",savePost);



// Route to unsave a post requested by User.

app.get("/unsavepost/:postId/:userId",unsavePost);


// Route to get all the saved posts of a user. Pass the user Id as parameter

app.get("/get_saved_posts/:userId",getSavedPosts);

app.post('/add_comment',addComments);

app.get("/getFeed/:user",getFeed);
             


app.listen(3001,()=>{
    console.log("Server is up");
})
