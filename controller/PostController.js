// import
const { MEMBER, BOARD, BOARD_IMAGE, REPLY } = require('../models')
const { SharedIniFileCredentials } = require('aws-sdk')
const spawn = require('child_process').spawn
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

const postSigninAction = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 로그인 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)
  const { email, password } = req.body

  try {
    // 사용자 조회
    const member = await MEMBER.findOne({
      where: { email },
    })

    if (!member) {
      res.json({ result: false, message: '사용자가 존재하지 않습니다' })
    }

    // 비밀번호 확인
    const compare = await comparePassword(password, member.password)
    if (compare) {
      // 비밀번호 일치
      res.json({ result: true, member })
    } else {
      res.json({ result: false, message: '비밀번호가 일치하지 않습니다' })
    }
  } catch (err) {
    console.log(err)
    res.json({ result: false, err: String(err) })
  }
}

const postSignout = (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 로그아웃 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('email:', req.body.email)
  // 로그아웃 버튼 누르면 생성되었던 토큰 사라지게 ""
  res.cookie('auth', '').json({ logoutSuccess: true })
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
      res.json({ result: false, message: '이미 존재하는 회원입니다' })
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

const postBoard = async (req, res) => {
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
    console.log(error)
  }
}

const postBoardRegister = (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시물 업로드 페이지 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  res.render('register')
}

const postBoardRegisterAction = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시물 업로드 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)
  console.log('req.file:', req.file)

  try {
    const { MEMBER_email, title, content } = req.body
    const createdBoard = await BOARD.create({
      MEMBER_email,
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

const postBoardRead = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ 게시물 읽기 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)

  try {
    const { bNo, email } = req.body

    const findedBoard = await BOARD.findOne({
      where: { bNo },

      include:
        //MEMBER와 조인, 시퀄라이즈 조인은 기본 inner join
        {
          model: MEMBER, // join할 모델
          required: false, // outer join으로 설정
          attributes: ['nickname'],
        },
    })
    console.log('findedBoard: ', findedBoard)
    let date = findedBoard.createdAt
    date =
      date.getFullYear() +
      '년 ' +
      (date.getMonth() + 1) +
      '월 ' +
      date.getDate() +
      '일 ' +
      date.getHours() +
      ':' +
      (date.getMinutes() > 10 ? date.getMinutes() : date.getMinutes() + '0')

    if (email == findedBoard.MEMBER_email) {
      console.log('작성자')
      res.render('read', {
        result: true,
        data: { findedBoard, writer: true, date },
      })
    } else {
      console.log('게스트')
      res.render('read', {
        result: true,
        data: { findedBoard, writer: false, date },
      })
    }
  } catch (error) {
    console.log(error)
    res.json({ result: false, message: String(error) })
  }
}

const postGraph = (req, res) => {
  res.render('graph')
}

const postGraphAction = async (req, res) => {
  console.log(
    ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ CFG 생성 ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
  )
  console.log('req.body:', req.body)
  console.log('req.file', req.file)

  let image = []

  const python = spawn('python3', [
    'graph.py',
    req.file[0].originalname,
    req.body.text,
  ])
  python.stdout.on('data', (data) => {
    console.log(
      ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ python start ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
    )
    console.log(`stdout : ${data}`)
    console.log(
      ' ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ python done ㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡㅡ '
    )
  })

  res.json({ result: true })
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

  postSignout,

  postBoard,
  postBoardRegister,
  postBoardRegisterAction,
  postBoardRead,

  postGraph,

  postProfile,
}

const bcryptPassword = (password) => {
  return bcrypt.hash(password, 10)
}

const comparePassword = (password, db_password) => {
  return bcrypt.compare(password, db_password)
}
