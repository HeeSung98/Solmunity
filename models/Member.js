const { DataTypes } = require('sequelize')

const Member = (sequelize) => {
  return sequelize.define(
    'MEMBER',
    {
      email: {
        type: DataTypes.STRING(50),
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      nickname: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      fromSocial: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
      },
      mImg: {
        type: DataTypes.STRING(255),
        defaultValue: null,
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

module.exports = Member
