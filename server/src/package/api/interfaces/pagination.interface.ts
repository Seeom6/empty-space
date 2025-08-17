

export class Pagination {
  limit: number;
  skip: number;
  needPagination?: boolean;
  total?: boolean;
}

export class PaginationRequest {
  page: number;
  limit: number;
  needPagination: boolean = false;
}

export const paginationKeys: string[] = Object.keys(new PaginationRequest());