import { Router } from "express";
import { postRouter } from "../modules/post/post.route";
import { CommentRouter } from "../modules/comment/comment.route";

export const router: Router = Router();

const moduleRoutes = [
  {
    path: "/post",
    route: postRouter,
  },
  {
    path: "/comment",
    route: CommentRouter,
  }
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
