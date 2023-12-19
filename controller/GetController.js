// import
const { MEMBER, BOARD, BOARD_IMAGE, REPLY } = require('../models')
const { SharedIniFileCredentials } = require('aws-sdk')
const bcrypt = require('bcrypt')
const dotenv = require('dotenv')
const jwt = require('jsonwebtoken')
const sequelize = require('sequelize')
const SECRET = process.env.SECRET_KEY
dotenv.config()

const getIndex = (req, res) => {
  res.render('index')
}

const getSignin = (req, res) => {
  res.render('signin')
}

const getSignup = (req, res) => {
  res.render('signup')
}

const getBoard = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시물 불러오기 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)

  try {
    // BOARD 테이블의 값 불러오기
    const findedBoard = await BOARD.findAll({
      // BOARD_IMAGE도 함께 가져오기 위해 테이블 join
      include: [
        //이미지 테이블과 조인, 시퀄라이즈 조인은 기본 inner join
        {
          model: BOARD_IMAGE, // join할 모델
          required: false, // outer join으로 설정
        },
        {
          model: MEMBER,
          required: false,
        },
      ],
      order: [['bNo', 'ASC']],
    })

    //게시물 번호
    const bNoList = findedBoard.map((board) => board.dataValues.bNo)
    //게시물 제목
    const titleList = findedBoard.map((board) => board.dataValues.title)
    //게시물 작성자
    const writerList = findedBoard.map(
      (board) => board.dataValues.MEMBER.nickname
    )
    //게시물 작성일
    const dateList = findedBoard.map((post) => {
      const createdAt = new Date(post.dataValues.createdAt)
      const now = new Date()
      const timeDiff = Math.floor((now - createdAt) / 1000) // 초 단위로 시간 차이 계산

      if (timeDiff < 60) {
        return `${timeDiff}초 전`
      } else if (timeDiff < 3600) {
        const minutes = Math.floor(timeDiff / 60)
        return `${minutes}분 전`
      } else {
        return createdAt.getMonth() + 1 + '월 ' + createdAt.getDate() + '일 '
      }
    })
    console.log('bNoList:', bNoList)
    console.log('titleList:', titleList)
    console.log('writerList:', writerList)
    console.log('dateList:', dateList)

    res.render('board', {
      data: {
        bNoList,
        titleList,
        writerList,
        dateList,
      },
    })
  } catch (error) {
    res.json({ result: false, message: String(error) })
  }
}

const getGraph = (req, res) => {
  res.render('graph')
}

module.exports = { getIndex, getBoard, getSignin, getSignup, getGraph }

const bcryptPassword = (password) => {
  return bcrypt.hash(password, 10)
}

const comparePassword = (password, db_password) => {
  return bcrypt.compare(password, db_password)
}
