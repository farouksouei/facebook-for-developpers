const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const JWT = require('jsonwebtoken');
const keys = require('../../config/keys');
//Load User Model
const User = require('../../models/User');

// @route   GET api/users/test
// @desc    Tests users route
// @access  Public

router.get('/test', (req, res) => res.json({ msg: 'Users Works' }));

// @route   GET api/users/register
// @desc    Register User
// @access  Public

router.post('/register', (req, res) => {
  User.findOne({email:req.body.email})
    .then(user => {
      if (user){
        return res.status(400).json({email:'Email already exists'});
      } else {
          const avatar = gravatar.url(req.body.email,{s:'200',r:'pg',d:'mm'});
        
          const newUser = new User({
            name:req.body.name,
            email:req.body.email,
            avatar:avatar,
            password:req.body.password,
          });

      //crypting the password
      bcrypt.genSalt(10,(err,salt) => {
        bcrypt.hash(newUser.password, salt,(err,hash) =>{
          if (err) throw err;
          newUser.password = hash;
          newUser.save()
            .then(user => res.json(user))
            .catch(err => console.log(err))
        })
      })
        }
    })
});

// @route   GET api/users/login
// @desc    Login User / return JWT token
// @access  Public

router.post('/login',(req,res) => {
  const email = req.body.email;
  const password = req.body.password;

  //find user by mail
User.findOne({email})
  .then(user => {
   if (!user){
     return res.status(404).json({email:'user not found'});
    }
  
  //check password
  bcrypt.compare(password,user.password)
   .then(isMatch =>{
     if(isMatch) {
       
      const payload = { id:user.id , name:user.name , avatar:user.avatar }
      JWT.sign(payload, keys.key, {expiresIn:3600},(err,token) => {
        res.json({
          success:true,
          token:'bearer'+ token
        })
      });
     } else {
       return res.status(400).json({password:"PASSWORD INCORRECT"});
     }
   })
  });

});


module.exports = router;
