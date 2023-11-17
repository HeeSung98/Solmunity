// import
const { MEMBER, BOARD, BOARD_IMAGE, REPLY } = require('../models')
const { SharedIniFileCredentials } = require('aws-sdk')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const sequelize = require('sequelize')
const SECRET = process.env.SECRET_KEY
dotenv.config()

const patchModfiyAction = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시물 수정 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)

  try {
    const { bNo, title, content } = req.body

    const findedBoard = await BOARD.findOne({
      where: { bNo },
    })
    await findedBoard.update({ title, content })
    console.log('findedBoard: ', findedBoard)

    res.json({ result: true, message: '게시물 업데이트 성공' })
  } catch (error) {
    console.log(error)
    res.json({ result: false, message: String(error) })
  }
}

module.exports = { patchModfiyAction }

const bcryptPassword = (password) => {
  return bcrypt.hash(password, 10)
}

const comparePassword = (password, db_password) => {
  return bcrypt.compare(password, db_password)
}
