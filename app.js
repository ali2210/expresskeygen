const express = require('express')
const morgan = require('morgan')   // logging purpose
const path = require('path')
const bodyParse = require('body-parser')
const AesEncryption = require('aes-encryption')
const rateLimit = require('express-rate-limit')
// var https = require('https');
// var fs = require('fs');

// var options = {
//   key: fs.readFileSync('./opt/serverkms.com.key'),
//   cert: fs.readFileSync('./opt/serverkms.com.cert')
// };


const app = express()
const port = 3000
const aes = new AesEncryption()
const limit = rateLimit({
    windowMs : 15*10*600,
    limit : 200,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
})


app.use(morgan('dev'))
app.use(express.json())
app.use(bodyParse.urlencoded({
    extended : true
}))
app.use(limit)

morgan.token('host', function(req, res) {

    return req.hostname;
});


if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}



app.get('/404', (req, res) => {

    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')  

    localStorage.setItem('404', '/404')

    res.sendStatus(403).send("unforuent server might be busy")
})

app.get('/503', (req, res) => {


    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')  

    localStorage.setItem('503', '/503')

    res.sendStatus(503).send("internal server conflict")
})


app.get("/login", (req, res) => {

    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')

    localStorage.setItem('login', '/login')

    res.sendFile(path.join(__dirname + '/index.html'))
});

app.post("/login/accept", (req, res) =>{

    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', '*')

    aes.setSecretKey('1a12b23c34d45e56f67178082c24e410255545535553555131031321313abaff')

    if (req.body.email.toString().length <= 0){

        res.sendStatus(404).send({'message' : '404 SERVER FAILED TO SERVE YOU'})
    }

    encrypt = aes.encrypt(req.body.email)

    localStorage.setItem('keygen', encrypt.toString())
    localStorage.setItem('accept', 'login/accept')

});


app.get('/login/last', (req, res) =>{

    res.send(localStorage.getItem('accept') || localStorage.getItem('404') || localStorage.getItem('503'))
});

app.get('/keys', (req, res) => {

    res.send(localStorage.getItem('keygen'))
});




app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})