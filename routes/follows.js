var express = require('express');
var router = express.Router();
let MongoClient = require('mongodb').MongoClient

let db
let dataFollow
let dataAboutUsers

MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }, (err, client) => {
     if (err) {
          return console.log(`ошибка:${err}`)
     }

     db = client.db("SocialNetwork")
     dataFollow = db.collection("dataFollow")
     dataAboutUsers = db.collection("dataAboutUsers")
})

router.use(function (req, res, next) {
     res.header("Access-Control-Allow-Origin", "https://evgeniy638.github.io");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
     res.header('Access-Control-Allow-Credentials', 'true')
     res.header('Access-Control-Allow-Methods', 'DELETE, POST, GET, PUT')
     next();
});

router.get("/subscriptions/:userId", (req, res) => {
     (async (userId) => {
          let following = await new Promise((resolve, reject) => {
               dataFollow.aggregate([
                    { $match: { userId } },
                    { $project: { _id: 0, following: 1 } }
               ]).toArray((err, result) => {
                    if (err) {
                         console.log(err)
                         return res.sendStatus(500)
                    }
                    resolve(result[0].following)
               })
          })

          let datas = []
          for (let i = 0; i < following.length; i++) {
               let data = await new Promise((resolve, reject) => {
                    dataAboutUsers.find(
                         { userId: following[i] }
                    ).toArray(
                         (err, result) => {
                              if (err) {
                                   console.log(err)
                                   return res.sendStatus(500)
                              }

                              resolve(result[0])
                         }
                    )
               })

               if (data === undefined || data === null) continue

               datas.push(data)
          }

          console.log(datas)
          res.send(datas)
     })(req.params.userId)
})

router.get("/subscribers/:userId", (req, res) => {
     (async (userId) => {
          let subscribers = await new Promise((resolve, reject) => {
               dataFollow.aggregate([
                    { $match: {userId} },
                    { $project: {followers: 1, _id:0} }
               ]).toArray(
                    (err, result) => {
                         if (err){
                              console.log(err)
                              res.sendStatus(500)
                         }

                         if (result[0] === undefined || result[0] === null) return resolve([])

                         resolve(result[0].followers)
                    }
               )
          })

          let datas=[]

          for (let i=0; i<subscribers.length; i++){
               let data = await new Promise(
                    (resolve, reject) => {
                         dataAboutUsers.find(
                             { userId: subscribers[i] }
                         ).toArray(
                              (err, result) => {
                                   if (err) {
                                        console.log(err)
                                        res.sendStatus(500)
                                   }

                                   resolve(result[0])
                              }
                         )
                    }
               )

               if (data === undefined || data === null) continue

               datas.push(data)
          }

          res.send(datas)

     })(req.params.userId)
})

module.exports = router;