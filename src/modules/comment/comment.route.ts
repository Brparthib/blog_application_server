import express, { Router } from 'express';
import { commentController } from './comment.controller';
import { auth, UserRole } from '../../middlewares/auth.middleware';

const router = express.Router();

router.get('/:id', commentController.getCommentById);
router.patch('/:id', auth(UserRole.USER, UserRole.ADMIN), commentController.updateComment);
router.delete('/:id', auth(UserRole.USER, UserRole.ADMIN), commentController.deleteComment);
router.get('/author/:authorId', commentController.getCommentByAuthorId);
router.post('/', auth(UserRole.USER, UserRole.ADMIN), commentController.createComment);
router.get('/', commentController.getAllComments);

export const CommentRouter: Router = router;
