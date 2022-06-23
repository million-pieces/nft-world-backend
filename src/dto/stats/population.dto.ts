import { AutoMap } from '@automapper/classes';

export class PopulationDto {
  @AutoMap()
    totalOwners: number = 0;

  @AutoMap()
    emperors: number = 0;

  @AutoMap()
    lords: number = 0;

  @AutoMap()
    imperialists: number = 0;

  @AutoMap()
    settlers: number = 0;

  @AutoMap()
    conquerors: number = 0;

  @AutoMap()
    landowners: number = 0;
}
