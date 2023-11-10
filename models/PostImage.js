const { DataTypes } = require('sequelize')

const PostImage = (sequelize) => {
  return sequelize.define(
    'POST_IMAGE',
    {
      iNo: {
        type: DataTypes.BIGINT(20),
        primaryKey: true,
        autoIncrement: true,
      },
      uuid: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      path: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
    },
    {
      timestamps: true, // createAt & updateAt 활성화
      freezeTableName: true, // 테이블명 복수화 중지
    }
  )
}

module.exports = PostImage
