// import
const {} = require('../models')
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

const postBoard = (req, res) => {
  res.render('board')
}

const postGraph = (req, res) => {
  res.render('graph')
}

const postProfile = (req, res) => {
  res.render('profile')
}

module.exports = { postIndex, postBoard, postGraph, postProfile }

const bcryptPassword = (password) => {
  return bcrypt.hash(password, 10)
}

const comparePassword = (password, db_password) => {
  return bcrypt.compare(password, db_password)
}
