const { DataTypes } = require('sequelize')

const Reply = (sequelize) => {
  return sequelize.define(
    'REPLY',
    {
      rNo: {
        type: DataTypes.BIGINT(20),
        primaryKey: true,
        autoIncrement: true,
      },
      text: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      MEMBER_email: DataTypes.STRING(50),
    },
    {
      charset: 'utf8', // 한국어 설정
      collate: 'utf8_general_ci', // 한국어 설정
      timestamps: true, // createAt & updateAt 활성화
      freezeTableName: true, // 테이블명 복수화 중지
    }
  )
}

module.exports = Reply
