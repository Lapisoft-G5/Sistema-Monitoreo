export interface IAreaResponse {
  id: string;
  nombre: string;
  isActive: boolean;
}

export interface IAreaListResponse {
  data: IAreaResponse[];
}
