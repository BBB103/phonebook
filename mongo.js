const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = encodeURIComponent(process.argv[2]);
const name = process.argv[3]
const number = process.argv[4] 
console.log('Raw password:', process.argv[2]);
console.log('Encoded password:', encodeURIComponent(process.argv[2]));

const url = `mongodb+srv://69club221:${password}@phonebookApp.tmqidfj.mongodb.net/phonebook?retryWrites=true&w=majority&appName=Phonebook`

console.log('Full connection URL:', url);


mongoose.set('strictQuery',false)

mongoose.connect(url)

const phonebookSchema = new mongoose.Schema({
  name: String,
  number: String,
  id: Number
})

const Person = mongoose.model('Phonebook', phonebookSchema)

const person = new Person({
  name: name,
  number: number,
  id: Math.floor(Math.random()*100)
})

person.save().then(result => {
  console.log('info saved! ', result.name, result.number)
})

Person.find({}).then(result => {
    console.log('Phonebook : ')
    result.forEach(p => {
    console.log(p.name, p.number)
  })
  mongoose.connection.close()
})