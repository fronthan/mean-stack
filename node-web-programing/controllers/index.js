const { Router } = require('express');
const router = Router()

//모든 폴더
router.use('/admin', require('./admin'));
//router.use('/contacts', require('./contacts'));


module.exports = router;