const express = require('express');
const router = express.Router();


function testMiddleware(req, res, next) {

  console.log('첫번재 미들웨어');
  next();

}

// function loginRequired(req, res, next) {
//   if() {

//   } else {
//     next();
//   }
// }

router.get('/', testMiddleware, (req, res) => {
  res.send("어드민 이ㅜㅎurl");
});

router.get('/products', (req, res) => {
  //res.send("어드민 proectsl");

  res.render('admin/products.html', {
    message: 'hello!!!!',
    online:'express'
  } )
});

router.get('/products/write', (req, res) => {
  res.render('admin/write.html');
});

router.post('/products/write', (req, res) => {
  res.send(req.body);
})
module.exports = router;
