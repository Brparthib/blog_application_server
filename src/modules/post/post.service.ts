import { Post, PostStatus } from "../../../generated/prisma/client";
import { PostWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";

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

    return postData
  });
}

export const postService = {
  createPost,
  getAllPosts,
  getPostById
};
