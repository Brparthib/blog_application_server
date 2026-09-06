import { CommnentStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";

const createComment = async (payload: {
    content: string;
    authorId: string;
    postId: string;
    parentId?: string
}) => {
    const postData = await prisma.post.findUniqueOrThrow({
        where: {
            id: payload.postId
        }
    });

    if (payload.parentId) {
        const commentData = await prisma.comment.findUniqueOrThrow({
            where: {
                id: payload.parentId
            }
        });
    }

    const result = await prisma.comment.create({
        data: payload
    });

    return result;
};

const getAllComments = async () => {
    const result = await prisma.comment.findMany();
    return result;
};

const getCommentById = async (commentId: string) => {
    const result = await prisma.comment.findUnique({
        where: {
            id: commentId
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                }
            }
        }
    });
    return result;
};

const getCommentByAuthorId = async (authorId: string) => {
    const result = await prisma.comment.findMany({
        where: {
            authorId: authorId
        },
        orderBy: {
            createdAt: "desc"
        },
        include: {
            post: {
                select: {
                    id: true,
                    title: true,
                }
            }
        }
    });
    return result;
};

const updateComment = async (commentId: string, payload: {
    content?: string;
    status?: CommnentStatus;
}, authorId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: commentId,
            authorId: authorId
        },
        select: {
            id: true
        }
    });

    if (!commentData) {
        throw new Error("Comment not found!");
    }

    const result = await prisma.comment.update({
        where: {
            id: commentData.id,
        },
        data: payload
    });

    return result;
};

const deleteComment = async (id: string, userId: string) => {
    const commentData = await prisma.comment.findFirst({
        where: {
            id: id
        },
        select: {
            id: true
        }
    });

    if (!commentData) {
        throw new Error("Comment not found!");
    }

    const result = await prisma.comment.delete({
        where: {
            id: commentData.id,
        },
    });

    return result;
};

export const commentService = {
    createComment,
    getAllComments,
    getCommentById,
    getCommentByAuthorId,
    updateComment,
    deleteComment,
};