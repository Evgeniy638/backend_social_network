var express = require('express');
var router = express.Router();
let MongoClient = require('mongodb').MongoClient

let db
let dataDialogs
let dataCookies

MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true }, (err, client) => {
     if (err) {
          return console.log(`ошибка:${err}`)
     }

     db = client.db("SocialNetwork")
     dataDialogs = db.collection("dataDialogs")
     dataCookies = db.collection("dataCookies")
})

router.use(function (req, res, next) {
     res.header("Access-Control-Allow-Origin", "https://evgeniy638.github.io");
     res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
     res.header('Access-Control-Allow-Credentials', 'true')
     res.header('Access-Control-Allow-Methods', 'DELETE, POST, GET, PUT')
     next();
});

router.get("/listDialogs/:userId", (req, res) => {
     (async (userId) => {

          dataDialogs.aggregate(
               { $match: { userId } },
               { $project: { _id: 0, dialogs: 1 } },
               { $unwind: "$dialogs" },
               {
                    $project: {
                         withUserName: "$dialogs.withUserName",
                         withUserId: "$dialogs.withUserId"
                    }
               },
               {
                    $project: {
                         withUserName: "$dialogs.withUserName",
                         withUserId: "$dialogs.withUserId"
                    }
               }
          ).toArray(
               (err, result) => {
                    if (err) {
                         console.log(err)
                         return res.sendStatus(500)
                    }

                    console.log("Get")

                    console.log(result)

                    res.send(result)
               }
          )

     })(req.params.userId)
})

router.get("/dialog", (req, res) => {
     let { withUserId, userId } = req.query

     dataDialogs.aggregate(
          { $match: { userId } },
          { $project: { _id: 0, dialogs: 1 } },
          { $unwind: "$dialogs" },
          {
               $project: {
                    withUserId: "$dialogs.withUserId",
                    dialog: "$dialogs.dialog"
               }
          },
          { $match: { withUserId } },
          { $project: { dialog: 1 } },
          { $unwind: "$dialog" },
          {
               $project: {
                    id: "$dialog.userId",
                    text: "$dialog.text"
               }
          },
          {
               $project: {
                    id: "$dialog.userId",
                    text: "$dialog.text"
               }
          }
     ).toArray(
          (err, result) => {
               if (err) {
                    console.log(err)
                    res.sendStatus(500)
               }

               console.log(result)

               res.send(result)
          }
     )
})

router.post("/sendMessage", (req, res) => {
     let { userId, withUserId, message } = req.body

     dataDialogs.update(
          {
               userId,
               "dialogs.withUserId": withUserId
          },
          {
               $push: {
                    "dialogs.$.dialog": message
               }
          },
          (err, result) => {
               if (err) {
                    console.log(err)
                    return res.sendStatus(500)
               }

               res.send()
          }
     )

     dataDialogs.update(
          {
               "userId": withUserId,
               "dialogs.withUserId": userId
          },
          {
               $push: {
                    "dialogs.$.dialog": message
               }
          },
          (err, result) => {
               if (err) {
                    console.log(err)
                    return res.sendStatus(500)
               }

               res.send()
          }
     )
})

router.put("/createDialog", (req, res) => {
     (async ({ userId, name, withUserId, withUserName }) => {

          let result = await new Promise(resolve => {
               dataDialogs.aggregate([
                    { $match: { userId } },
                    { $project: { _id: 0, dialogs: 1 } },
                    { $unwind: "$dialogs" },
                    {
                         $project: {
                              withUserId: "$dialogs.withUserId",
                              dialog: "$dialogs.dialog"
                         }
                    },
                    { $match: { withUserId } },
                    { $project: { withUserId: 1 } },
               ]).toArray((err, result) => {
                    if (err) {
                         console.log(err)
                         return res.sendStatus(500)
                    }
                    resolve(result[0])
               })
          })

          if (result !== undefined && result !== null) {
               return res.send()
          }

          await dataDialogs.updateOne({ userId, name }, {
               $push: { dialogs: { withUserId, withUserName, dialog: [] } }
          }, (err, result) => {
               if (err) {
                    console.log(err)
                    res.sendStatus(500)
               }

               console.log("Create1")
          })

          await dataDialogs.updateOne({
               userId: withUserId,
               name: withUserName
          }, {
                    $push: {
                         dialogs: {
                              withUserId: userId,
                              withUserName: name,
                              dialog: []
                         }
                    }
               }, (err, result) => {
                    if (err) {
                         console.log(err)
                         res.sendStatus(500)
                    }

                    console.log("Create2")
               })

          res.send()

     })(req.body)
})

router.get("/isDeleteThisProfile/:withUserId", (req, res) => {
     let withUserId = req.params.withUserId

     dataCookies.findOne({ userId: withUserId }, {}, (err, result) => {
          if (err) {
               console.log(err)
               return res.sendStatus(500)
          }

          res.send(result === undefined || result === null)
     })
})

module.exports = router;
