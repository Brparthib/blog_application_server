import { Comment, Post, PostStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

type FlattenedComment = Comment & { depth: number , totalReplies: number };

function flattenComments(comments: Comment[]): FlattenedComment[] {
  const childrenMap = new Map<string | null, Comment[]>();

  // Group comments by parentId
  for (const comment of comments) {
    const parentId = comment.parentId;

    if (!childrenMap.has(parentId)) {
      childrenMap.set(parentId, []);
    }

    childrenMap.get(parentId)!.push(comment);
  }

  const result: FlattenedComment[] = [];

  function traverse(
    parentId: string | null,
    depth: number
  ): void {
    const children = childrenMap.get(parentId) ?? [];

    for (const comment of children) {
      const replies = childrenMap.get(comment.id) || [];
      result.push({
        ...comment,
        depth,
        totalReplies: replies.length,
      });

      // Find replies to this comment
      traverse(comment.id, depth + 1);
    }
  }

  // Start from root comments
  traverse(null, 0);

  return result;
}

const createPost = async (
  data: Omit<Post, "id" | "createdAt" | "updatedAt" | "authorId">,
  useId: string,
) => {
  const result = await prisma.post.create({
    data: {
      ...data,
      authorId: useId,
    },
  });

  return result;
};

const getAllPosts = async (payload: {
  search?: string | undefined;
  tags?: string[] | [];
  isFeatured?: boolean | undefined;
  status?: PostStatus | undefined;
  authorId?: string | undefined;
  page?: number;
  limit?: number;
  skip?: number;
  sortBy?: string;
  sortOrder?: string;
}) => {
  const andConditions: PostWhereInput[] = [];

  if (payload.search) {
    andConditions.push({
      OR: [
        {
          title: {
            contains: payload.search as string,
            mode: "insensitive",
          },
        },
        {
          content: {
            contains: payload.search as string,
            mode: "insensitive",
          },
        },
        {
          tags: {
            has: payload.search as string,
          },
        },
      ],
    });
  }

  if (payload.tags && payload.tags.length > 0) {
    andConditions.push({
      tags: {
        hasEvery: payload.tags as string[],
      },
    });
  }

  if (typeof payload.isFeatured === "boolean") {
    andConditions.push({
      isFeatured: payload.isFeatured as boolean,
    });
  }

  if (payload.status) {
    andConditions.push({
      status: payload.status as PostStatus,
    });
  }

  if (payload.authorId) {
    andConditions.push({
      authorId: payload.authorId as string,
    });
  }

  const result = await prisma.post.findMany({
    where: {
      AND: andConditions,
    },
    take: payload.limit as number,
    skip: payload.skip as number,
    orderBy: {
      [payload.sortBy as string]: payload.sortOrder as string,
    },
    include: {
      _count: {
        select: {
          comments: true
        }
      }
    }
  });

  const total = await prisma.post.count({
    where: {
      AND: andConditions
    }
  })

  return {
    data: result,
    meta: {
      total,
      page: payload.page,
      limit: payload.limit,
      totalPages: Math.ceil(total / Number(payload.limit))
    }
  };
};

const getPostById = async (postId: string) => {
  return await prisma.$transaction(async (tx) => {
    await tx.post.update({
      where: {
        id: postId,
      },
      data: {
        views: {
          increment: 1,
        },
      },
    });

    const postData = await tx.post.findUnique({
      where: {
        id: postId,
      },
    });

    if (!postData) {
      throw new Error("Post not found");
    }

    const comments = await tx.comment.findMany({
      where: {
        postId,
        status: "APPROVED"
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const flatComments = flattenComments(comments);

    return {
      ...postData,
      comments: flatComments,
      totalComment: flatComments.length,
    };
  });
}

export const postService = {
  createPost,
  getAllPosts,
  getPostById
};
