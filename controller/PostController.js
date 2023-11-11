// import
const { MEMBER, BOARD, BOARD_IMAGE, REPLY } = require('../models')
const { SharedIniFileCredentials } = require('aws-sdk')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const sequelize = require('sequelize')
const SECRET = process.env.SECRET_KEY
dotenv.config()

const postIndex = (req, res) => {
  res.render('index')
}

const postSignin = (req, res) => {}

const postSigninAction = (req, res) => {
  res.json({ result: true, message: '로그인 성공' })
}

const postSignup = (req, res) => {
  res.render('signup')
}

const postSignupAction = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 회원가입 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)
  const { email, name, nickname, password, fromSocial } = req.body
  const hash = await bcryptPassword(password) // 비밀번호 암호화

  try {
    const findedMember = await MEMBER.findOne({
      where: { email },
    })
    console.log('findedMember:', findedMember)

    if (findedMember) {
      throw new Error('이미 가입된 회원입니다')
    }

    const createdMember = await MEMBER.create({
      email,
      name,
      nickname,
      password: hash,
      fromSocial,
    })

    console.log('createdMember:', createdMember)
    res.json({ result: true, message: '회원 가입 성공' })
  } catch (error) {
    console.log(error)
    res.json({ result: false, message: String(error) })
  }
}

const postBoard = (req, res) => {
  res.render('board')
}

const postRegister = (req, res) => {
  res.render('register')
}

const postRegisterAction = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시물 업로드 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)
  console.log('req.file:', req.file)

  try {
    const { email, title, content } = req.body
    const createdBoard = await BOARD.create({
      email,
      title,
      content,
    })
    console.log('createdBoard:', createdBoard)

    // 게시물 이미지 테이블에 레코드 추가하기
    if (typeof req.file !== 'undefined') {
      const createdBoardImage = await BOARD_IMAGE.create({
        uuid: req.file.key,
        path: req.file.location,
        BOARD_bNO: createdBoard.bNo,
      })

      console.log('createdBoardImage:', createdBoardImage)
    }

    res.json({ result: true, message: '게시물 업로드 성공' })
  } catch (error) {
    console.log(error)
    res.json({ result: false, message: String(error) })
  }
}

const postRead = (req, res) => {
  res.render('read')
}

const postGraph = (req, res) => {
  res.render('graph')
}

const postProfile = (req, res) => {
  res.render('profile')
}

module.exports = {
  postIndex,

  postSignin,
  postSigninAction,

  postSignup,
  postSignupAction,

  postBoard,
  postRegister,
  postRegisterAction,
  postRead,

  postGraph,

  postProfile,
}

const bcryptPassword = (password) => {
  return bcrypt.hash(password, 10)
}

const comparePassword = (password, db_password) => {
  return bcrypt.compare(password, db_password)
}
