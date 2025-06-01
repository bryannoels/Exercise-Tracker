const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()

app.use(cors())
app.use(express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let users = []
let exercises = []

app.post('/api/users', (req, res) => {
  const { username } = req.body
  const _id = Date.now().toString(36) + Math.random().toString(36).substring(2)
  const newUser = { username, _id }
  users.push(newUser)
  res.json(newUser)
})

app.get('/api/users', (req, res) => {
  res.json(users)
})

app.post('/api/users/:_id/exercises', (req, res) => {
  const { description, duration, date } = req.body
  const user = users.find(u => u._id === req.params._id)
  if (!user) return res.status(404).json({ error: 'User not found' })
  
  let exerciseDate = date
  if (!exerciseDate) {
    exerciseDate = new Date().toISOString().substring(0, 10)
  }

  const exercise = {
    _id: user._id,
    username: user.username,
    description,
    duration: parseInt(duration),
    date: exerciseDate,
  }
  exercises.push(exercise)
  res.json({
    _id: exercise._id,
    username: exercise.username,
    description: exercise.description,
    duration: exercise.duration,
    date: new Date(exercise.date).toDateString()
  });
})

app.get('/api/users/:_id/logs', (req, res) => {
  const user = users.find(u => u._id === req.params._id)
  if (!user) return res.status(404).json({ error: 'User not found' })

  let log = exercises.filter(e => e._id === user._id)

  const { from, to, limit } = req.query

  if (from) {
    const fromDate = new Date(from)
    log = log.filter(e => new Date(e.date) >= fromDate)
  }

  if (to) {
    const toDate = new Date(to)
    log = log.filter(e => new Date(e.date) <= toDate)
  }

  if (limit) {
    log = log.slice(0, parseInt(limit))
  }

  res.json({
    username: user.username,
    count: log.length,
    _id: user._id,
    log: log.map(({ description, duration, date }) => ({
      description,
      duration,
      date: new Date(date).toDateString()
    }))
  })

})


const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
