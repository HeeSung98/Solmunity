const { DataTypes } = require('sequelize')

const BOARD = (sequelize) => {
  return sequelize.define(
    'BOARD',
    {
      bNo: {
        type: DataTypes.BIGINT(20),
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      content: {
        type: DataTypes.STRING(),
        allowNull: false,
      },
      like: {
        type: DataTypes.BIGINT(20),
        defaultValue: 0,
      },
    },
    {
      charset: 'utf8', // 한국어 설정
      collate: 'utf8_general_ci', // 한국어 설정
      timestamps: true, // createAt & updateAt 활성화
      freezeTableName: true, // 테이블명 복수화 중지
    }
  )
}

module.exports = BOARD
