const mongoose = require("mongoose");
const User = mongoose.model("User");
const sha256 = require("js-sha256");
const jwt = require("jwt-then");
const mailgun = require("mailgun-js");
const DOMAIN = 'sandboxf60729aa45934a018cd399081ac3f729.mailgun.org';
const mg = mailgun({apiKey: process.env.MAILGUN_APIKEY, domain: DOMAIN});

exports.register = async (req, res) => {
  const { name, email, password } = req.body;

  const emailRegex = /@gmail.com|@yahoo.com|@hotmail.com|@live.com/;

  if (!emailRegex.test(email)) throw "Email is not supported from your domain.";
  if (password.length < 6) throw "Password must be atleast 6 characters long.";

//   const userExists = await User.findOne({
//     email,
//   });

// //   if (userExists) throw "User with same email already exits.";

const token = await jwt.sign({ name,email }, process.env.SECRET,{expiresIn:'20m'});

  const data = {
	from: 'Ack@RadoTech.com',
	to: email,
	subject: 'Activate your account',
    html: `<h2>Please click on the link for the activiation</h2>
    <a>${process.env.CLIENT_URL}/authentication/activate/${token}</a>`
};
mg.messages().send(data, function (error, body) {
    if(error) {return res.json({error:err.message})}
    // return res.json({message:"Email has been sent please activate"});
});


  // const user = new User({
  //   name,
  //   email,
  //   password: sha256(password + process.env.SALT),
  // });

  // await user.save();

  res.json({
    message: "User [" + name + "] registered successfully!",
  });
};
//verification send....
exports.activateAccount=async(req,res)=>{
  const {token}=req.body;
  console.log(token);
  if(token){ console.log("Act12 token err");
   let decodedToken=await jwt.verify(token,process.env.SECRET);
   if(decodedToken)
   {
  //   if(err){  console.log("Act token err",err);
  //     // return res.status(400).json({message:'Incorrect or Expired link.'})
  // }
  const {name, email}=decodedToken;
  console.log(name,email,decodedToken);
  let a=await User.findOne({email})
  if(a){return res.status(400).json({error:"User with this email already exists."});}
  else{
  let newUser= new User({name, email});
  newUser.save((err,success)=>{
    console.log("Act12");
    if(err){  console.log("A32ct");
      console.log("Error in signupp",err);
      return res.status(400).json({error:err})
    }
    console.log("Act token err1");
    res.json({message:"signup success!"})
  })
}



}
  else{  console.log("Act token err",err);
   return res.status(400).json({message:'Incorrect or Expired link.'})
   }
  }
  else{ console.log("Act token err2");
    return res.json({error:"something went wrong!!!"})
  }
}


exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({
    email,
    password: sha256(password + process.env.SALT),
  });

  if (!user) throw "Email and Password did not match.";

  const token = await jwt.sign({ id: user.id }, process.env.SECRET);

  res.json({
    message: "User logged in successfully!",
    token,
  });
};