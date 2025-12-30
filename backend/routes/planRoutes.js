// planRoutes.js
const express = require("express");
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');

const { getdepartment, getUserRoles } = require("../controllers/headerController.js");
const {
  getCommentsByNewsItemId,
  getCommentsByNewsItemIdf,
  approveComment,
  deleteComment,
  postComment,
  getMediaItems,
  updateMediaItem,
  deleteMediaItem,
  addMediaItem, editNews,
  editEvent,
  deleteNews,
  deleteEvent, postNews, getNews, postEvent, getEvents, getProfilePicture, uploadProfilePicture } = require("../controllers/profileUploadController")




// News routes
router.post('/news', verifyToken, postNews);
router.get('/news', verifyToken, getNews);
router.get('/news', verifyToken, getNews);
router.get('/newsf', getNews);

router.delete('/deleteNews/:id', verifyToken, deleteNews);
router.put('/editNews/:id', verifyToken, editNews);
// Event routes
router.post('/events', verifyToken, postEvent);
router.get('/events', verifyToken, getEvents);
router.get('/eventsf', getEvents);
router.delete('/deleteEvent/:id', verifyToken, deleteEvent);
router.put('/editEvent/:id', verifyToken, editEvent);


// media 
router.post('/media', verifyToken, addMediaItem);
router.get('/media', verifyToken, getMediaItems);
router.get('/mediaf', getMediaItems);
router.delete('/media/:id', verifyToken, deleteMediaItem);
router.put('/mediaup/:id', verifyToken, updateMediaItem);


// user information
router.get("/getdepartment", verifyToken, getdepartment);
router.get('/userrole', verifyToken, getUserRoles);

// profile pic 
router.post('/uploadProfilePicture', verifyToken, uploadProfilePicture);
router.get("/getprofile/:user_id", verifyToken, getProfilePicture); // API endpoint

// comments
router.post('/news/:newsItemId/comments', postComment);

router.get('/news/:newsItemId/comments', verifyToken, getCommentsByNewsItemId);
router.get('/newsf/:newsItemId/comments', getCommentsByNewsItemIdf);

// Route to approve a comment (likely an admin-protected route)
router.put('/comments/:commentId/approve', verifyToken, approveComment);

// Route to delete a comment (likely an admin-protected route)
router.delete('/comments/:commentId', verifyToken, deleteComment);

module.exports = router;
