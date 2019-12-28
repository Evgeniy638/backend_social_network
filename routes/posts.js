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

//http://localhost:3001/posts/read/userId2
router.get('/read/:id', (req, res) => {
  (async (userId) => {

    let dataPosts = await new Promise(
      resolve => {
        db.collection("dataPosts").findOne({ userId: userId }, (err, result) => {
          if (err) {
            console.log(err)
            res.sendStatus(500)
          }

          resolve(result)
        })
      }
    )

    for (let i = 0; i < dataPosts.arrayPost.length; i++) {
      dataPosts.arrayPost[i].countLikes = dataPosts.arrayPost[i].usersWhoLikes.length
      dataPosts.arrayPost[i].isLiked = dataPosts.arrayPost[i].usersWhoLikes.some(id => id === userId)
      delete dataPosts.arrayPost[i].usersWhoLikes
    }

    res.send(dataPosts)


  })(req.params.id, req.body)
});

//http://localhost:3001/posts/write/userId2"
router.post('/write/:id', (req, res) => {
  (async (userId, post) => {

    let cookieId = await new Promise(
      resolve => {
        db.collection('dataCookies').findOne({ userId }, (err, result) => {
          if (err) {
            console.log(err)
            res.sendStatus(500)
          }

          resolve(result.cookieId)
        })
      }
    )

    if (req.cookies.cookieId !== cookieId) return res.send("error")

    await db.collection('dataPosts').updateOne(
      { userId },
      { $push: { arrayPost: post } },
      (err, result) => {
        if (err) {
          console.log(err)
          res.sendStatus(500)
        }
      }
    )

    post.countLikes = post.usersWhoLikes.length
    post.isLiked = post.usersWhoLikes.some(id => id === userId)
    delete post.usersWhoLikes

    res.send(post)

  })(req.params.id, req.body)
});

router.put('/toggleLike', (req, res) => {
  (async ({ userId, idUserPost, idPost }) => {
    if (userId === null || userId === undefined) return res.send()

    let cookieId = await new Promise(
      resolve => {
        db.collection('dataCookies').findOne({ userId }, (err, result) => {
          if (err) {
            console.log(err)
            res.sendStatus(500)
          }

          resolve(result.cookieId)
        })
      }
    )

    if (req.cookies.cookieId !== cookieId) return res.send()

    let usersWhoLikes = await new Promise(
      (resolve) => {
        db.collection("dataPosts").aggregate(
          { $match: { userId: idUserPost } },
          { $project: { _id: 0, arrayPost: 1 } },
          { $unwind: "$arrayPost" },
          { $project: { id: "$arrayPost.id", usersWhoLikes: "$arrayPost.usersWhoLikes" } },
          { $match: { id: +idPost } },
          { $match: { id: +idPost } }
        ).toArray(
          (err, result) => {
            if (err) {
              console.log(err)
              res.sendStatus(500)
            }

            resolve(result[0].usersWhoLikes)
          }
        )
      }
    )

    let isLiked = await usersWhoLikes.some(id => id === userId)

    if (isLiked) {
      usersWhoLikes = await usersWhoLikes.filter(id => id !== userId)
    } else {
      await usersWhoLikes.push(userId)
    }

    await db.collection("dataPosts").updateOne(
      {
        userId: idUserPost,
        "arrayPost.id": +idPost
      }, {
        $set: {
          "arrayPost.$.usersWhoLikes": usersWhoLikes
        }
      },
      (err, result) => {
        if (err) {
          console.log(err)
          res.sendStatus(500)
        }
      }
    )

    await res.send(
      {
        usersWhoLikes
      }
    )

  })(req.body)
})

module.exports = router;