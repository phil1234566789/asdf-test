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

export type CodeResolution =
  | { type: 'empty' }
  | { type: 'hint';  message: string }
  | { type: 'valid'; name: string; price: number }
  | { type: 'error'; message: string };
