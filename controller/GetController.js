// import
const {} = require('../models')
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
  res.render('singup')
}

const getBoard = (req, res) => {
  res.render('board')
}

module.exports = { getIndex, getBoard, getSignin, getSignup }

const bcryptPassword = (password) => {
  return bcrypt.hash(password, 10)
}

const comparePassword = (password, db_password) => {
  return bcrypt.compare(password, db_password)
}
