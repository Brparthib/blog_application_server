import { Router } from "express";
import { postRouter } from "../modules/post/post.route";

export const router: Router = Router();

const moduleRoutes = [
  {
    path: "/post",
    route: postRouter,
  },
];

moduleRoutes.forEach((route) => {
  router.use(route.path, route.route);
});
