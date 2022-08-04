export class CitizenMetadataDto {
  id: number;

  image: string;

  description: string;

  attributes: [
    {
      trait_type: 'Segment ID',
      value: number,
    },
    {
      trait_type: 'Cave ID',
      value: number,
    },
    {
      trait_type: 'Income',
      value: number,
    },
  ];
}
