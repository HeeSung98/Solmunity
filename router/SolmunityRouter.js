const express = require('express')
const multer = require('multer')
const multerS3 = require('multer-s3')
const aws = require('aws-sdk')
const dotenv = require('dotenv')
const router = express.Router()
const getController = require('../controller/GetController')
const postController = require('../controller/PostController')
const patchController = require('../controller/PatchController')
const deleteController = require('../controller/DeleteController')
dotenv.config()

// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ AWS S3 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

aws.config.update({
  accessKeyId: process.env.S3_KEYID,
  secretAccessKey: process.env.S3_ACCESSKEY,
  region: process.env.S3_REGION,
  bucket: process.env.S3_BUCKET,
})

const s3 = new aws.S3()

const uploadBoard = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read',
    metadata: function (req, file, callback) {
      callback(null, { fieldName: file.fieldname })
    },
    key: function (req, file, callback) {
      callback(null, 'room-' + Date.now().toString() + '-' + file.originalname)
    },
  }),
})

// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ GET ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

router.get('/', getController.getIndex)

router.get('/signin', getController.getSignin)

router.get('/signup', getController.getSignup)

router.get('/board', getController.getBoard)

// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ POST ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

router.post('/', postController.postIndex)

router.post('/board', postController.postBoard)

router.post('/graph', postController.postGraph)

router.post('/profile', postController.postProfile)

router.post('/register', postController.postRegister)

router.post(
  '/register/action',
  uploadBoard.single('file'),
  postController.postRegisterAction
)

module.exports = router
