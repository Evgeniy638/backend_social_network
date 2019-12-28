var express = require('express');
var router = express.Router();
let MongoClient = require('mongodb').MongoClient
let fs = require('fs')
let path = require('path')

let db
let dataAboutUsers

MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }, (err, client) => {
     if (err) {
          return console.log(`ошибка:${err}`)
     }

     db = client.db("SocialNetwork")
     dataAboutUsers = db.collection("dataAboutUsers");
})

router.use(function (req, res, next) {
     res.header("Access-Control-Allow-Origin", "https://evgeniy638.github.io");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
     res.header('Access-Control-Allow-Credentials', 'true')
     res.header('Access-Control-Allow-Methods', 'DELETE, POST, GET, PUT')
     next();
});

// origin path: '/profileUser'

router.put('/changePhotoAvatar', (req, res) => {

     const {newPhotoAvatar, userId} = req.body
     
     // const newPath = path.join(__dirname, `../public/images/${newPhotoAvatar.name}`)
     // const oldPath = newPhotoAvatar.value
     // console.log(newPhotoAvatar)
     // console.log(newPath)
     // console.log(oldPath)

     // fs.renameSync(oldPath, newPath)

     dataAboutUsers.updateOne(
          {userId},
          {
               $set: { avatarImg: newPhotoAvatar}
          },
          (err, result) => {
               if (err){
                    console.log(err)
                    res.sendStatus(500)
               }
          }
     )

     res.send()
})

module.exports = router;