import { Request, Response } from "express";
import { postService } from "./post.service";
import { PostStatus } from "../../../generated/prisma/enums";
import { paginationHelper } from "../../helpers/paginationHelper";

const createPost = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const result = await postService.createPost(
      req.body,
      req.user.id as string,
    );

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create post",
      error: error,
    });
  }
};

const getAllPosts = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string;
    const tags = req.query.tags ? (req.query.tags as string).split(",") : [];
    const isFeatured = req.query.isFeatured
      ? req.query.isFeatured === "true"
        ? true
        : req.query.isFeatured === "false"
          ? false
          : undefined
      : undefined;

    const status = req.query.status as PostStatus | undefined;

    const authorId = req.query.authorId as string | undefined;

    const {
      page,
      limit,
      skip,
      sortBy,
      sortOrder
    } = paginationHelper(req.query);

    const result = await postService.getAllPosts({
      search,
      tags,
      isFeatured,
      status,
      authorId,
      page,
      limit,
      skip,
      sortBy,
      sortOrder
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get posts",
      error: error,
    });
  }
};

const getPostById = async (req: Request, res: Response) => {
  try {
    const postId = req.params.id as string;
    if (!postId) {
      return res.status(400).json({
        message: "Post ID is required",
      });
    }

    const result = await postService.getPostById(postId);

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to get post",
      error: error,
    });
  }
};

export const postController = {
  createPost,
  getAllPosts,
  getPostById
};
