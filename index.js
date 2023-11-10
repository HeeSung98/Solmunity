const express = require('express')
const db = require('./models')
const app = express()
const path = require('path')
const PORT = 8000

app.set('view engine', 'ejs')
app.set('views', './views')

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static(path.join(__dirname, 'public')))

//router 분리
const router = require('./router/SolmunityRouter')
app.use('/', router)

//오류처리
app.use('*', (req, res) => {
  res.status(404).render('404')
})

db.sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`)
  })
})
