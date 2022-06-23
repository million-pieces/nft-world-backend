export interface IOpenseaAsset {
  id: number;
  num_sales: number;
  background_color: string;
  image_url: string;
  image_preview_url: string;
  image_thumbnail_url: string;
  image_original_url: string;
  animation_url: string;
  animation_original_url: string;
  name: string;
  description: string;
  external_link: string;

  asset_contract: {
    address: string;
    asset_contract_type: string;
    created_date: Date;
    name: string;
    nft_version: number;
    opensea_version: number;
    owner: number;
    schema_name: string;
    symbol: string;
    total_supply: number;
    description: string;
    external_link: string;
    image_url: string;
    default_to_fiat: boolean;
    dev_buyer_fee_basis_points: number;
    dev_seller_fee_basis_points: number;
    only_proxied_transfers: boolean;
    opensea_buyer_fee_basis_points: number;
    opensea_seller_fee_basis_points: number;
    buyer_fee_basis_points: number;
    seller_fee_basis_points: number;
    payout_address: string;
  };

  permalink: string;

  sell_orders: [{
    base_price: number;
  }];

  last_sale: {
    total_price: number;
  }

  token_id: 3751
}
