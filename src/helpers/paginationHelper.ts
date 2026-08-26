type PaginationOptions = {
    page?: number,
    limit?: number,
    skip?: number,
    sortBy?: string | undefined
    sortOrder?: string | undefined,
}

type OptionResult = {
    page: number;
    limit: number;
    skip: number;
    sortBy: string;
    sortOrder: string;
}

export const paginationHelper = (options: PaginationOptions): OptionResult => {
    const page: number = Number(options.page || 1);
    const limit: number = Number(options.limit || 10);
    const skip = (page - 1) * limit;

    const sortBy: string = options.sortBy || "createdAt";
    const sortOrder: string = options.sortOrder || "desc";

    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder
    };
}