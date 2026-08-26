import express, { Router } from 'express';
import { postController } from './post.controller';
import { auth, UserRole } from '../../middlewares/auth.middleware';

const router = express.Router();

router.post('/', auth(UserRole.USER), postController.createPost);
router.get('/', postController.getAllPosts);
router.get('/:id', postController.getPostById);

export const postRouter: Router = router;