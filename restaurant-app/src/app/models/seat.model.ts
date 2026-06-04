export type SeatOrder = {
  code: string;
  name: string;
  price: number;
};

export type Seat = {
  id: number;
  orders: SeatOrder[];
  isRef: boolean;
};
