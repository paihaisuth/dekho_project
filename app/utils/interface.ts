export interface IpaginationFormat<T> {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
  items: T[];
}
