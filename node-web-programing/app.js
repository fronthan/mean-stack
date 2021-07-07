const express = require('express');

const admin = require('./routes/admin');
const contacts = require('./routes/contacts');

const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send('hello express');
});

app.use('/admin', admin);
app.use('/contacts', contacts);

app.listen(port, ()=> {
  console.log('express listening on port', port);
});