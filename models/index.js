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

db.mMember = require('./Member')(sequelize)
db.mPost = require('./Post')(sequelize)
db.mPostImage = require('./PostImage')(sequelize)
db.mReply = require('./Reply')(sequelize)

// 멤버와 게시물의 연관관계
db.mMember.hasMany(db.mPost, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
  onDelete: 'CASCADE',
})
db.mPost.belongsTo(db.mMember, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
})

// 멤버와 댓글의 연관관계
db.mMember.hasMany(db.mReply, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
  onDelete: 'CASCADE',
})
db.mReply.belongsTo(db.mMember, {
  foreignKey: 'MEMBER_email',
  sourceKey: 'email',
})

// 게시글과 댓글의 연관관계
db.mPost.hasMany(db.mReply, {
  foreignKey: 'POST_pNo',
  sourceKey: 'pNo',
  onDelete: 'CASCADE',
})
db.mReply.belongsTo(db.mPost, {
  foreignKey: 'POST_pNo',
  sourceKey: 'pNo',
})

//게시글과 게시글이미지의 연관관계
db.mPost.hasMany(db.mPostImage, {
  foreignKey: 'POST_pNo',
  sourceKey: 'pNo',
  onDelete: 'CASCADE',
})
db.mPostImage.belongsTo(db.mPost, {
  foreignKey: 'POST_pNo',
  sourceKey: 'pNo',
})

db.sequelize = sequelize
db.Sequelize = Sequelize

module.exports = db
