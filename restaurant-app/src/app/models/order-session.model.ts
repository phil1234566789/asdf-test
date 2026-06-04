export type OrderStatus = 'open' | 'completed';

export type OrderSession = {
  id: string;
  tableKey: string;
  zoneId: string;
  isMenu: boolean;
  createdAt: Date;
  createdBy: string;
  createdByName: string;
  status: OrderStatus;
};
