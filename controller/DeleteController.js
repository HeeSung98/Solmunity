// import
const { MEMBER, BOARD, BOARD_IMAGE, REPLY } = require('../models')
const { SharedIniFileCredentials } = require('aws-sdk')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const sequelize = require('sequelize')
const SECRET = process.env.SECRET_KEY
dotenv.config()

const deleteBoardRemove = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시물 삭제 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)

  try {
    const { bNo } = req.body

    await BOARD.destroy({ where: { bNo } })

    res.json({ result: true, message: '게시글이 삭제되었습니다.' })
  } catch (error) {
    res.json({ result: false, message: String(error) })
  }
}

module.exports = { deleteBoardRemove }

const bcryptPassword = (password) => {
  return bcrypt.hash(password, 10)
}

const comparePassword = (password, db_password) => {
  return bcrypt.compare(password, db_password)
}
