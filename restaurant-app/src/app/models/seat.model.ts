export type GuestOrder = {
  code: string;
  name: string;
  price: number;
  destination: 'kitchen' | 'bar';
  printed: boolean;
};

export type Seat = {
  id: number;
  orders: GuestOrder[];
  isRef: boolean;
};
