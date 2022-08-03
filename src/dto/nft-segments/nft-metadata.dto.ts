export class NftMetadataDto {
  id: number;

  name: string;

  attributes: [
    {
      trait_type: 'Artwork',
      value: string;
    },
    {
      trait_type: 'Country',
      value: string;
    },
    {
      trait_type: 'Coordinates',
      value: string;
    },
  ];

  image: string;
}
