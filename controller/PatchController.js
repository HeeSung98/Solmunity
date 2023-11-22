// import
const { MEMBER, BOARD, BOARD_IMAGE, REPLY } = require('../models')
const { SharedIniFileCredentials } = require('aws-sdk')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const sequelize = require('sequelize')
const SECRET = process.env.SECRET_KEY
dotenv.config()

const patchBoardModify = async (req, res) => {
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

const patchProfileModify = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 회원 정보 수정 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)

  try {
    const { email, type, nickname, password, prevent } = req.body

    const findedMember = await MEMBER.findOne({ where: { email } })
    console.log('findedMember: ', findedMember)

    if (type == 'nickname') {
      await findedMember.update({ nickname })
      console.log('updatedMemer:', findedMember)

      res.json({
        result: true,
        member: findedMember,
        message: '닉네임이 변경되었습니다.',
      })
      return
    }

    if (type == 'password' && prevent == 'ok') {
      const hash = await bcryptPassword(password) // 비밀번호 암호화
      await findedMember.update({ password: hash })
      console.log('updatedMemer:', findedMember)

      res.json({
        result: true,
        member: findedMember,
        message: '비밀번호가 변경되었습니다.',
      })
      return
    } else {
      res.json({ result: false, message: '비정상적인 접근입니다.' })
      return
    }
  } catch (error) {
    console.log(error)
    res.json({ result: false, message: String(error) })
  }
}

module.exports = { patchBoardModify, patchProfileModify }

const bcryptPassword = (password) => {
  return bcrypt.hash(password, 10)
}
