export interface IOpenseEventsAssets {
  asset: {
    id: number;
    image_original_url: string;
    name: string;
    permalink: string;
  },

  auction_type: string;

  ending_price: number;
}
