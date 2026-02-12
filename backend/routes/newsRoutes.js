const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const verifyToken = require('../middleware/verifyToken');
const { upload, validateUploadedFile } = require('../middleware/uploadMiddleware');
const { sanitizeInput, validateRequired } = require('../middleware/inputValidation');
const { hasMenuPermission } = require('../middleware/menuPermissionMiddleware');
const { submissionLimiter, publicApiLimiter } = require('../middleware/rateLimiter');
const verifyCaptcha = require('../middleware/captchaMiddleware');

// Public routes for fetching news
router.get('/news', publicApiLimiter, newsController.getAllNews);
router.get('/newsf', publicApiLimiter, newsController.getAllNews); // Frontend alias
router.get('/news/:id', publicApiLimiter, newsController.getNewsById);
router.get('/news/:id/comments', publicApiLimiter, newsController.getCommentsByPostId);
router.get('/newsf/:id/comments', publicApiLimiter, newsController.getCommentsByPostId);
router.get(
    '/admin/news/:id/comments',
    verifyToken,
    hasMenuPermission('/post/managePosts'),
    newsController.getCommentsByPostIdAdmin
);

// Post comment with input validation, rate limiting and CAPTCHA
router.post(
    '/news/:id/comments',
    submissionLimiter,
    verifyCaptcha,
    sanitizeInput([]),
    validateRequired(['text', 'name', 'email']),
    newsController.postComment
);

// Protected routes for managing news
router.post(
    '/news',
    verifyToken,
    hasMenuPermission('/post/managePosts'),
    upload.any(),
    validateUploadedFile,
    sanitizeInput(['description', 'excerpt'], ['youtubeUrl']), // Allow HTML in description and excerpt
    validateRequired(['title', 'description', 'date', 'category']),
    newsController.createNews
);

router.put(
    '/editNews/:id',
    verifyToken,
    hasMenuPermission('/post/managePosts'),
    upload.any(),
    validateUploadedFile,
    sanitizeInput(['description', 'excerpt'], ['youtubeUrl']),
    newsController.updateNews
);

router.delete(
    '/deleteNews/:id',
    verifyToken,
    hasMenuPermission('/post/managePosts'),
    newsController.deleteNews
);

// Admin Comment Moderation
router.get(
    '/comments/all',
    verifyToken,
    hasMenuPermission('/interaction/comments'),
    newsController.getAllCommentsAdmin
);

router.patch(
    '/comments/:id/approve',
    verifyToken,
    hasMenuPermission('/interaction/comments'),
    newsController.approveComment
);

router.delete(
    '/comments/:id',
    verifyToken,
    hasMenuPermission('/interaction/comments'),
    newsController.deleteComment
);

module.exports = router;
