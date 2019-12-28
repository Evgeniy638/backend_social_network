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

/* GET users listing. */
router.post('/loginByPasswordAndLogin', (req, res, next) => {
     (async ({ login, password }) => {

          let data = await new Promise((resolve) => {
               db.collection("dataCookies").aggregate([
                    { $match: { login, password } },
                    {
                         $lookup:
                         {
                              from: "dataAboutUsers",
                              localField: "userId",
                              foreignField: "userId",
                              as: "dataAboutUsers"
                         }
                    },
                    { $unwind: "$dataAboutUsers" },
                    {
                         $project: {
                              _id: 0,
                              userId: 1,
                              login: 1,
                              password: 1,
                              name: "$dataAboutUsers.name"
                         }
                    }]
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

          if (data === undefined || data === null) return res.send({
               error: true,
               message: "Неправильный логин и/или пароль"
          })

          let newCookieId = `${randomCookieId()}${data.userId}`

          db.collection("dataCookies").updateOne(
               { login, password },
               { $set: { cookieId: newCookieId } },
               (err, result) => {
                    if (err) {
                         console.log(`ошибка: /n ${err}`)
                         return res.sendStatus(500)
                    }
               }
          )

          res.clearCookie("cookieId")
          res.cookie("cookieId", newCookieId, {domain: "https://evgeniy638.github.io"})

          res.send({
               error: false,
               cookieId: newCookieId
          })

     })(req.body)

     //http://localhost:3001/login/loginByPasswordAndLogin
});

//http://localhost:3001/login/loginByCookie

router.get('/loginByCookie', (req, res, next) => {
     let cookieId = req.cookies.cookieId
     console.log(cookieId)

     if (cookieId === null || cookieId === undefined) return res.send("error")

     db.collection("dataCookies").aggregate([
          { $match: { cookieId } },
          {
               $lookup:
               {
                    from: "dataAboutUsers",
                    localField: "userId",
                    foreignField: "userId",
                    as: "dataAboutUsers"
               }
          },
          { $unwind: "$dataAboutUsers" },
          {
               $project: {
                    _id: 0,
                    userId: 1,
                    login: 1,
                    password: 1,
                    name: "$dataAboutUsers.name"
               }
          }]
     ).toArray(
          (err, result) => {
               if (err) {
                    console.log(err)
                    return res.sendStatus(500)
               }

               res.send(result[0])
          }
     )
})

//http://localhost:3001/login/logout

router.delete('/logout', (req, res) => {
     let cookieId = req.cookies.cookieId
     res.clearCookie("cookieId")

     if (cookieId === null || cookieId === undefined) return res.send("error")

     db.collection("dataCookies").updateOne({ cookieId }, { $set: { cookieId: "undefined" } }, (err, result) => {
          if (err) {
               console.log(err)
               return res.sendStatus(500)
          }
     })

     res.send()
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