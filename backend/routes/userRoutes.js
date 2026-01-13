const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// ユーザー認証・登録
router.post('/register', userController.register);
router.post('/login', userController.login);

// ユーザー情報取得 ( /api/users/:email )
router.get('/users/:email', userController.getUserInfo);

module.exports = router;
