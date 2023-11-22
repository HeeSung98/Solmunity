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

const upload = multer({
  storage: multerS3({
    s3,
    bucket: process.env.S3_BUCKET,
    acl: 'public-read',
    metadata: function (req, file, callback) {
      callback(null, { fieldName: file.fieldname })
    },
    key: function (req, file, callback) {
      callback(null, 'board-' + Date.now().toString() + '-' + file.originalname)
    },
  }),
})

// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ GET ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

router.get('/', getController.getIndex)

router.get('/signin', getController.getSignin)

router.get('/signup', getController.getSignup)

router.get('/board', getController.getBoard)

router.get('/graph', getController.getGraph)

// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ POST ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

router.post('/', postController.postIndex)

router.post('/signin/action', postController.postSigninAction)

router.post('/signup/action', postController.postSignupAction)

router.post('/signout', postController.postSignout)

router.post('/board', postController.postBoard)

router.post('/board/search', postController.postBoardSearch)

router.post('/board/register', postController.postBoardRegister)

router.post(
  '/board/register/action',
  upload.single('file'),
  postController.postBoardRegisterAction
)

router.post('/board/read', postController.postBoardRead)

router.post('/board/modify', postController.postBoardModify)

router.post('/board/reply/register', postController.postReplyRegister)

router.post('/graph', postController.postGraph)

router.post(
  '/graph/action',
  upload.single('file'),
  postController.postGraphAction
)

router.post('/profile', postController.postProfile)

router.post('/profile/password', postController.postProfilePassword)

// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ PATCH ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

router.patch('/board/modify/action', patchController.patchBoardModify)

router.patch('/profile/modify', patchController.patchProfileModify)

// ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ DELETE ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ

router.delete('/board/read/remove', deleteController.deleteBoardRemove)

router.delete('/board/reply/remove', deleteController.deleteReplyRemove)

module.exports = router
