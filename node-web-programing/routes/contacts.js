const express = require('express');
const router = express.Router();

router.get('/', (req, res) =>{
  res.send('contacts route');
});

router.get('/list', (req, res) => {
  res.send('contacts/list router')
});

module.exports = router;