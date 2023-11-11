'use strict'

const Sequelize = require('sequelize')
const process = require('process')
const env = process.env.NODE_ENV || 'development'
const config = require(__dirname + '/../config/config.json')[env]
const db = {}

let sequelize

if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config)
} else {
  sequelize = new Sequelize(
    config.database,
    config.username,
    config.password,
    config
  )
}

db.MEMBER = require('./Member')(sequelize)
db.BOARD = require('./Board')(sequelize)
db.BOARD_IMAGE = require('./BoardImage')(sequelize)
db.REPLY = require('./Reply')(sequelize)

// 멤버와 게시물의 연관관계
db.MEMBER.hasMany(db.BOARD, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
  onDelete: 'CASCADE',
})
db.BOARD.belongsTo(db.MEMBER, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
})

// 멤버와 댓글의 연관관계
db.MEMBER.hasMany(db.REPLY, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
  onDelete: 'CASCADE',
})
db.REPLY.belongsTo(db.MEMBER, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
})

// 게시글과 댓글의 연관관계
db.BOARD.hasMany(db.REPLY, {
  foreignKey: 'BOARD_bNo',
  sourceKey: 'bNo',
  onDelete: 'CASCADE',
})
db.REPLY.belongsTo(db.BOARD, {
  foreignKey: 'BOARD_bNo',
  sourceKey: 'bNo',
})

//게시글과 게시글이미지의 연관관계
db.BOARD.hasMany(db.BOARD_IMAGE, {
  foreignKey: 'BOARD_bNo',
  sourceKey: 'bNo',
  onDelete: 'CASCADE',
})
db.BOARD_IMAGE.belongsTo(db.BOARD, {
  foreignKey: 'BOARD_bNo',
  sourceKey: 'bNo',
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
