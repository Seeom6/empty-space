import { Query } from '@nestjs/common';
import { PaginationPipe } from '@Package/api/pipes/pagination.pipe';


export function Pagination(){
  return Query(PaginationPipe)
}