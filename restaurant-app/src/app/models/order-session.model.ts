export type OrderStatus =
  | 'new'             // Bestellung aufgenommen, noch nicht gesendet
  | 'in_progress'     // An Küche/Bar gesendet und ausgedruckt
  | 'payment_pending' // Essen serviert, Bezahlung ausstehend
  | 'completed';      // Bezahlt, Session geschlossen, Bestellung wird aus Übersicht entfernt

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
