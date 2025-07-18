const express = require('express');
const morgan = require('morgan');
const cors = require('cors');  // Correct package name

const app = express();

// Middleware setup
app.use(cors());               // Enable CORS
app.use(express.json());
app.use(express.static('dist'));
morgan.token('data', function (req, res) { return req.method==='POST'?  JSON.stringify(req.body) : ""})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))
let persons = [
    { 
      id: "1",
      name: "Arto Hellas", 
      number: "040-123456"
    },
    { 
      id: "2",
      name: "Ada Lovelace", 
      number: "39-44-5323523"
    },
    { 
      id: "3",
      name: "Dan Abramov", 
      number: "12-43-234345"
    },
    { 
      id: "4",
      name: "Mary Poppendieck", 
      number: "39-23-6423122"
    }
]

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    response.json(persons)
})

app.get('/api/persons/:id', (request, response) => {
    const id = request.params.id
    const person = persons.find(person => person.id === id)
    if (person) {
        response.json(person)
    } else {
        response.status(404).end()
    }
})

app.get('/info', (request, response) => {
    const time = new Date()
    response.send(`
        <h1>Phonebook has info of ${persons.length} people</h1>
        <p>${time}</p>
        `
    )
})

app.delete('/api/persons/:id', (request, response) => {
    console.log('Before deletion ', persons)
    const id = request.params.id
    persons = persons.filter(person => person.id !== id)
    response.status(204).end()
    console.log('After deletion ', persons)
})

app.post('/api/persons', (request, response) => {
    const Body = request.body
    const newPerson = {...Body, id:String(Math.floor(Math.random()*100))}
    const exist = (persons.filter(person => person.name === newPerson.name).length!==0) || (persons.filter(person => person.number === newPerson.number).length!==0) || (newPerson.name === undefined) || (newPerson.number) === undefined
    if (!exist) {
        persons.push(newPerson)
        response.json(newPerson) 
        console.log(persons)
    } else {
        console.log('not allowed!!')
        response.status(204).end()
    }
})
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
