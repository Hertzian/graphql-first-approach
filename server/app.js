const path = require('path')
require('dotenv').config()

const express = require('express')
const mongoose = require('mongoose')
const multer = require('multer')
const { graphqlHTTP } = require('express-graphql')
require('dotenv').config()
const cors = require('cors')

const graphqlSckema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolvers')

const app = express()
app.use(cors())

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images')
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

app.use(express.json()) // application/json
app.use(
  multer({ storage: fileStorage, fileFilter: fileFilter }).single('image')
)
app.use('/images', express.static(path.join(__dirname, 'images')))

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  // this solves the cors error or, use cors middleware
  //if (req.method === 'OPTIONS') return res.sendStatus(200)
  next()
})

app.use(
  '/graphql',
  graphqlHTTP({
    schema: graphqlSckema,
    rootValue: graphqlResolver,
    graphiql: true,
    customFormatErrorFn(err) {
      if (!err.originalError) return err
      const data = err.originalError.data
      const message = err.message || 'An error ocurred'
      const code = err.originalError.code || 500
      return { message: message, status: code, data: data }
    }
  })
)

app.use((error, req, res, next) => {
  console.log(error)
  const status = error.statusCode || 500
  const message = error.message
  const data = error.data
  res.status(status).json({ message: message, data: data })
})

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then((result) => {
    app.listen(process.env.PORT)
    console.log(`Server running on http://localhost:${process.env.PORT}`)
  })
  .catch((err) => console.log(err))
