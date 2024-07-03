require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express()
const cors = require('cors')

// DB Connection
const uri = process.env.MONGO_URI;
mongoose.connect(uri).then(()=>console.log("Database connected"));

// Models
let User = require('./models/User');
let Exercise = require('./models/Exercise');

app.use(cors())
app.use(express.static('public'))
app.use('/api/users',bodyParser.urlencoded({extended:false}));
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

// Create User
app.post('/api/users', async (req, res)=>{
  const username = req.body.username;
  try{
    const newUser = new User({username});
    const saveData = await newUser.save();
    res.json({username:saveData.username,_id:saveData._id});
  } catch(err){
    console.log(err);
    res.json({error:"Something went wrong please try again"});
  }
});
// Get All User
app.get('/api/users', async (req, res)=>{
  try{
    const users = await User.find();
    return res.json(users);
  } catch(err){
    console.log(err);
    res.json({error:"Something went wrong, please try again"});
  }
});
//Add exercise for the user
app.post('/api/users/:_id/exercises', async (req, res)=>{
  const { _id } = req.params;
  console.log(_id);
  const {description, duration, date} = req.body;
  const excerciseDate = date ? new Date(date).toISOString().split('T')[0]: new Date().toISOString().split('T')[0];
  try{
    const user = await User.findById({_id});
    if(!user){
      return res.status(404).json({error:"User not found"});
    }

    const newExcersie = new Exercise({
      userId: _id,
      description:description,
      duration:duration,
      date:excerciseDate
    });

    const saveExcersie = await newExcersie.save();
    res.json({
      username:user.username,
      description:saveExcersie.description,
      duration:saveExcersie.duration,
      date:new Date(saveExcersie.date).toDateString(),
      _id:user._id
    })

  } catch(err){
    console.log(err);
    res.json({error:"Something went wrong, please try again"})
  }
});
// App logs to retrive full excersies of the user
app.get("/api/users/:_id/logs", async (req, res)=>{
  try{
    const { _id } = req.params;
    const {from, to, limit} = req.query;
    const user = await User.findById(_id);
    
    if(!user){
      return res.json({error:"User not found"});
    }
    let filter = { userId:_id };
    if(from || to){
      filter.date = {};
      if (from) filter.date.$gte = new Date(from).toISOString().split('T')[0];
      if (to) filter.date.$lte = new Date(to).toISOString().split('T')[0];

    }
    let query = Exercise.find(filter);
    if (limit) query = query.limit(parseInt(limit));

    const exercises = await query.exec();
    res.json({
      username: user.username,
      count: exercises.length,
      log: exercises.map(e => ({
        description: e.description,
        duration: e.duration,
        date:  new Date(e.date).toDateString(),
      })),
    });
  }catch (err) {
    console.log(err);
    res.json({error:"Something went wrong"});
  }
});
const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port http://localhost:' + listener.address().port)
})
