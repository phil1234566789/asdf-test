export type TableShape = {
  shape?: 'rect' | 'round';
  seats?: number;
};

export type TableZone = {
  id: string;
  label: string;
  prefix: string;
  tables: TableZoneConfig;
};

export type TableZoneConfig = {
  count: number;
  defaultShape?: 'rect' | 'round';
  defaultSeats?: number;
  overrides?: TableOverride[];
};

export type TableOverride = TableShape & {
  numbers: number[];
};

export type ResolvedTable = Required<TableShape> & {
  key: string;
  zoneId: string;
  number: number;
};
