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
router.get('/read', (req, res, next) => {
  // let content = fs.readFileSync("JSON/dataAboutUsers.json", "utf8")
  // content = JSON.parse(content)

  db.collection("dataAboutUsers").find({}).toArray((err, content) => {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    }

    let { pageSize, numberPage } = req.query

    if (pageSize === null || pageSize === undefined || pageSize > 10) pageSize = 10

    let numberOfPages = Math.ceil(content.length / pageSize)

    if (numberPage === null || numberPage === undefined || numberPage < 1) numberPage = 1
    if (numberPage > numberOfPages) numberPage = numberOfPages

    let pageData = []
    let firstIndexsPage = pageSize * (numberPage - 1)
    let lastIndexPage = pageSize * numberPage - 1
    for (let i = firstIndexsPage; i <= lastIndexPage; i++) {
      if (i < content.length) pageData.push(content[i])
    }

    //pageSize numberPage

    //http://localhost:3001/users/read?pageSize=3&numberPage=2

    res.send({ pageData, numberOfPages })
  })
});

//http://localhost:3001/users/follow

router.get('/follow', (req, res, next) => {
  let userId = req.query.userId

  db.collection('dataFollow').find({ userId: userId }, { projection: { _id: 0, following: 1 } }).toArray((err, result) => {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    }

    res.send(result[0].following)
  })
})

router.post('/follow', (req, res, next) => {
  let { userId, followingId } = req.body

  db.collection('dataFollow').updateOne({ userId: userId }, { $push: { following: followingId } }, (err, result) => {
    if (err) {
      console.log(`ERROR:${err}`)
      return res.sendStatus(500)
    }
  })

  db.collection('dataFollow').updateOne({ userId: followingId }, { $push: { followers: userId } }, (err, result) => {
    if (err) {
      console.log(`ERROR:${err}`)
      return res.sendStatus(500)
    }
  })

  res.send()
})

router.delete('/follow', (req, res, next) => {

  let { userId, unfollowingId } = req.query

  db.collection('dataFollow').updateOne({ userId: userId }, { $pull: { following: unfollowingId } }, (err, result) => {
    if (err) {
      console.log(`ERROR:${err}`)
      return res.sendStatus(500)
    }
  })

  db.collection('dataFollow').updateOne({ userId: unfollowingId }, { $pull: { followers: userId } }, (err, result) => {
    if (err) {
      console.log(`ERROR:${err}`)
      return res.sendStatus(500)
    }
  })

  res.send()
})

//http://localhost:3001/users/status

router.put('/status', (req, res) => {
  let { newStatus, userId } = req.body

  db.collection("dataAboutUsers").updateOne({ userId: userId }, { $set: { status: newStatus } }, (err, result) => {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    }
  })

  res.send(newStatus)
})

router.put('/name', (req, res) => {
  let { newName, userId } = req.body

  db.collection("dataAboutUsers").updateOne({ userId: userId }, { $set: { name: newName } }, (err, result) => {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    }
  })

  res.send(newName)
})

router.put('/surname', (req, res) => {
  let { newSurname, userId } = req.body

  db.collection("dataAboutUsers").updateOne({ userId: userId }, { $set: { surname: newSurname } }, (err, result) => {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    }
  })

  res.send(newSurname)
})

router.put('/city', (req, res) => {
  let { newCity, userId } = req.body

  db.collection("dataAboutUsers").updateOne({ userId: userId }, { $set: { "location.city" : newCity } }, (err, result) => {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    }
  })

  res.send(newCity)
})

router.put('/country', (req, res) => {
  let { newCountry, userId } = req.body

  db.collection("dataAboutUsers").updateOne({ userId: userId }, { $set: { "location.country" : newCountry } }, (err, result) => {
    if (err) {
      console.log(err)
      res.sendStatus(500)
    }
  })

  res.send(newCountry)
})

router.get('/userData/:userId', (req, res)=>{
  let userId = req.params.userId

  db.collection('dataAboutUsers').findOne({userId}, (err, result)=>{
    if (err){
      console.log(err)
      return res.sendStatus(500)
    }

    res.send(result)
  })
})

router.get('/getUserPhoto/:userId', (req, res) => {
  let userId = req.params.userId

  db.collection('dataAboutUsers').findOne({userId}, 
    (err, result) =>{
      if (err){
        console.log(err)
        return res.sendStatus(500)
      }

      if (result === null || result === undefined){
        return res.send("error")
      }

      res.send(result.avatarImg)
    })
})

module.exports = router;