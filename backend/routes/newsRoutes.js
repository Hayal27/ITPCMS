const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const verifyToken = require('../middleware/verifyToken');
const { restrictTo } = require('../middleware/roleMiddleware');

const upload = require('../middleware/uploadMiddleware');

// Public routes for fetching news
router.get('/news', newsController.getAllNews);
router.get('/newsf', newsController.getAllNews); // Frontend alias
router.get('/news/:id', newsController.getNewsById);
router.get('/news/:id/comments', newsController.getCommentsByPostId);
router.get('/newsf/:id/comments', newsController.getCommentsByPostId);
router.post('/news/:id/comments', newsController.postComment);

// Protected routes for managing news (admin only)
router.post('/news', verifyToken, restrictTo(1), upload.any(), newsController.createNews);
router.put('/editNews/:id', verifyToken, restrictTo(1), upload.any(), newsController.updateNews);
router.delete('/deleteNews/:id', verifyToken, restrictTo(1), newsController.deleteNews);

module.exports = router;
