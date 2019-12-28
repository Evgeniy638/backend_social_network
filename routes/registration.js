var express = require('express');
var router = express.Router();
let MongoClient = require('mongodb').MongoClient

let db

MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }, (err, client) => {
     if (err) {
          return console.log(`ошибка:${err}`)
     }

     db = client.db("SocialNetwork")
})

router.use(function (req, res, next) {
     res.header("Access-Control-Allow-Origin", "https://evgeniy638.github.io");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
     res.header('Access-Control-Allow-Credentials', 'true')
     res.header('Access-Control-Allow-Methods', 'DELETE, POST, GET, PUT')
     next();
});

router.delete("/delete/:userId", (req, res) => {
     let userId = req.params.userId

     db.collection("dataCookies").deleteOne({
          userId
     }, (err, result) => {
          if (err) {
               console.log(err)
               return res.sendStatus(500)
          }
     })

     db.collection("dataAboutUsers").deleteOne({
          userId
     }, (err, result) => {
          if (err) {
               console.log(err)
               return res.sendStatus(500)
          }
     })

     db.collection("dataDialogs").deleteOne({
          userId
     }, (err, result) => {
          if (err) {
               console.log(err)
               return res.sendStatus(500)
          }
     })

     db.collection("dataFollow").deleteOne({
          userId
     }, (err, result) => {
          if (err) {
               console.log(err)
               return res.sendStatus(500)
          }
     })

     db.collection("dataPosts").deleteOne({
          userId
     }, (err, result) => {
          if (err) {
               console.log(err)
               return res.sendStatus(500)
          }
     })

     res.send()
})

router.post("/", (req, res) => {
     (async ({ login, password, email, userId, phone, name, surname, country, city }) => {

          let errorlogin = await new Promise((resolve) => db.collection("dataCookies").findOne(
               {login},
               (err, result) => {
                    if (err){
                         console.log(err)
                         res.sendStatus(500)
                    }

                    if (result === undefined || result === null){
                         resolve(false)
                    }else{
                         resolve(true)
                    }
               }
          ))

          if (errorlogin) return res.send({
               error: true,
               message: "Логин уже занят"
          })

          let errorUserId = await new Promise((resolve) => db.collection("dataCookies").findOne(
               {userId},
               (err, result) => {
                    if (err){
                         console.log(err)
                         res.sendStatus(500)
                    }

                    if (result === undefined || result === null){
                         resolve(false)
                    }else{
                         resolve(true)
                    }
               }
          ))

          if (errorUserId) return res.send({
               error: true,
               message: "Никнейм уже занят"
          })

          let cookieId = `${randomCookieId()}${userId}`

          await db.collection("dataCookies").insertOne({
               userId,
               cookieId,
               login,
               password,
               email,
               phone,
               name,
               surname
          }, (err, result) => {
               if (err) {
                    console.log(err)
                    return res.sendStatus(500)
               }
          })

          await db.collection("dataAboutUsers").insertOne({
               userId, name, surname,
               status: "", avatarImg: "undefined",
               location: {
                    country,
                    city
               }
          }, (err, result) => {
               if (err) {
                    console.log(err)
                    return res.sendStatus(500)
               }
          })

          await db.collection("dataDialogs").insertOne({
               userId, name, dialogs: []
          }, (err, result) => {
               if (err) {
                    console.log(err)
                    return res.sendStatus(500)
               }
          })

          await db.collection("dataFollow").insertOne({
               userId, followers: [], following: [], friends: []
          }, (err, result) => {
               if (err) {
                    console.log(err)
                    return res.sendStatus(500)
               }
          })

          await db.collection("dataPosts").insertOne({
               userId, arrayPost: []
          }, (err, result) => {
               if (err) {
                    console.log(err)
                    return res.sendStatus(500)
               }
          })

          res.cookie("cookieId", cookieId)
          res.send({
               error: false,
               userId,
               login,
               password,
               name
          })

     })(req.body)


})

module.exports = router;

//functions
const randomCookieId = () => {
     let cookieId = ""

     for (let i = 0; i < 20; i++) {
          let newChar = String.fromCharCode("a".charCodeAt(0) + Math.floor(26 * Math.random()))

          if (Math.round(Math.random())) {
               newChar = String.fromCharCode("a".charCodeAt(0) + Math.floor(26 * Math.random()))
          } else {
               newChar = String.fromCharCode("A".charCodeAt(0) + Math.floor(26 * Math.random()))
          }

          cookieId = `${cookieId}${newChar}`
     }

     return cookieId
}