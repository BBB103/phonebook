require('dotenv').config()
const Person = require('./models/person')
const express = require('express');
const app = express();
const morgan = require('morgan');
const cors = require('cors');  // Correct package name
const e = require('cors');
const { error } = require('cros/common/logger');

// Middleware setup
app.use(cors());               // Enable CORS
app.use(express.json());
app.use(express.static('dist'));
morgan.token('data', function (req, res) { return req.method==='POST'?  JSON.stringify(req.body) : ""})
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :data'))


app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response) => {
    console.log(Person,'45')
    Person.find({}).then(p => {
        response.json(p)
    })
})

app.get('/api/persons/:id', (request, response, next) => {
    const id = request.params.id
    Person.findById(id).then(target => {
        if(target) {response.json(target)}
        else {response.status(404).end()}
    }).catch(error => next(error))
})

app.get('/info', (request, response) => {
    Person.countDocuments({})
        .then(amount => {
            response.send(`
        <h1>Phonebook has info of ${amount} people</h1>
        <p>${new Date()}</p>`)
        })
})

app.delete('/api/persons/:id', (request, response) => {
    console.log('Before deletion ', Person)
    const id = request.params.id
    Person.findByIdAndDelete(id)
        .then(deletedPerson => {
            if(deletedPerson) {
                response.status(204).end()
            } else {
                response.status(404).end()
            }
        })
        .catch(error => {
            response.status(400).json({error: 'invalid format'})
        })
    console.log('After deletion ', Person)
})

app.put('/api/persons/:id', (request, response, next) => {
    const {number} = request.body
    Person.findById(request.params.id)
        .then(target => {
            if(!target) return response.status(404).end()
            target.number = number      
            return target.save().then(updated => {
                response.json(updated)
            })
        })
        .catch(error => next(error))
})


app.post('/api/persons', (request, response) => {
    const Body = request.body;
    const newPerson = { ...Body };
    
    // Replace array filters with proper MongoDB query
    Person.findOne({
        $or: [
            { name: newPerson.name },
            { number: newPerson.number }
        ]
    }).then(existingPerson => {
        const exists = existingPerson !== null || 
                     newPerson.name === undefined || 
                     newPerson.number === undefined;
        
        if (!exists) {
            const person = new Person(newPerson);
            person.save().then(saved => {
                console.log('saved', saved);
                response.json(saved);
            });
        } else {
            console.log('not allowed!!');
            response.status(400).json({ 
                error: 'name or number already exists or fields missing' 
            });
        }
    }).catch(error => {
        console.error('Error checking duplicates:', error);
        response.status(500).json({ error: 'server error' });
    });
});

const unknownEndpoint = (request, response)     => {
    response.status(404).send({ error : 'unknown endpoint'})
}  
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
    console.log(error.message)
    if (error.name === 'CastError') {
        response.status(400).send({ error : 'malformatted id'})
    }
    next(error)
}
app.use(errorHandler)


const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
