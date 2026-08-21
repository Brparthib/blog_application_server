import { Request, Response } from "express";
import { postService } from "./post.service";

const createPost = async (req: Request, res: Response) => {
  try {
    const result = await postService.createPost(req.body);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create post",
      error: error,
    });
  }
};

export const postController = {
  createPost,
};
