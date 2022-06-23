export interface TokenTransfer {
  timestamp: number,

  from: {
    id: string;
  },

  to: {
    id: string;
  },

  token: {
    id: string;
    coordinate: string;
  }
}
