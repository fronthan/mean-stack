const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send("어드민 이ㅜㅎurl");
});

router.get('/products', (req, res) => {
  res.send("어드민 proectsl");
});

module.exports = router;
