import { Request, Response } from "express";
import { commentService } from "./comment.service";

const createComment = async (req: Request, res: Response) => {
  try {
    const user = req.user;
    if (!user?.id) {
      throw new Error("User not found!");
    }
    req.body.authorId = user.id;
    const result = await commentService.createComment(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create comment",
      error: error,
    });
  }
};

const getAllComments = async (req: Request, res: Response) => {
  const result = await commentService.getAllComments();
  res.status(200).json(result);
};

const getCommentById = async (req: Request, res: Response) => {
  const commentId = req.params.id;
  const result = await commentService.getCommentById(commentId as string);
  res.status(200).json(result);
};

const getCommentByAuthorId = async (req: Request, res: Response) => {
  const authorId = req.params.id;
  const result = await commentService.getCommentByAuthorId(authorId as string);
  res.status(200).json(result);
};

const updateComment = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const commentId = req.params.id;
  const result = await commentService.updateComment(commentId as string, req.body, userId as string);
  res.status(200).json(result);
};

const deleteComment = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const commentId = req.params.id;
  const result = await commentService.deleteComment(commentId as string, userId as string);
  res.status(200).json(result);
};

export const commentController = {
  createComment,
  getAllComments,
  getCommentById,
  getCommentByAuthorId,
  updateComment,
  deleteComment,
};