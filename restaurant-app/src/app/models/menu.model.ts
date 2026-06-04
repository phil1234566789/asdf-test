export type MenuItem = {
  name: string;
  description?: string;
  price: number;
  spiceLevel: number;
};

export type ResolvedDish = {
  name: string;
  price: number;
};
