import express, { Router } from 'express';
import { postController } from './post.controller';
import { auth, UserRole } from '../../middlewares/auth.middleware';

const router = express.Router();

router.get('/my-posts', auth(UserRole.USER, UserRole.ADMIN), postController.getMyPosts);
router.patch('/:id', auth(UserRole.USER, UserRole.ADMIN), postController.updatePost);
router.delete('/:id', auth(UserRole.USER, UserRole.ADMIN), postController.deletePost);
router.get('/:id', postController.getPostById);
router.post('/', auth(UserRole.USER, UserRole.ADMIN), postController.createPost);
router.get('/', postController.getAllPosts);

export const postRouter: Router = router;