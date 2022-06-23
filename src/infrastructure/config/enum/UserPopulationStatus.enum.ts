/**
 * User population status.
 *
 * Each status, except emperor, depends on segments amount.
 * User gain emperor status when bought all NFT segments of one country.
 */
export enum UserPopulationStatus {
  Emperor, // Owns country

  Imperialist, // 100 >= segments

  Conquerer, // 30 => segments

  Lord, // 10=> segments

  Settler, // >= 5 segments

  Landowner, // < 5 segments
}
