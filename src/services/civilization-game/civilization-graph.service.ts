/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import { Injectable } from '@nestjs/common';
import { gql, GraphQLClient } from 'graphql-request';

import { CivilizationConfigService } from '../../infrastructure/config/civilization-config.service';

import { ICivilizationSegmentOwner } from './interface/civilization-segment-owner.interface';
import { IGQLCivilizationToken } from './interface/civilization-segment.interface';
import { IGQLCivilizationUser } from './interface/civilization-user.interface';

@Injectable()
export class CivilizationGraphService {
  private readonly client = new GraphQLClient(this.configService.graphURI);

  constructor(
    private readonly configService: CivilizationConfigService,
  ) {}

  async getUsersByCaveId(caveId: number): Promise<ICivilizationSegmentOwner[]> {
    const query = gql`
      query ($caveId: ID!) {
        users (first: 1000) {
          address
          token(where: {caveId: $caveId}, first: 1000) {
            id
            tokenId
            segmentId
            caveId
          }
        }
      }
    `;

    const result = await this.client.request(query, {
      caveId,
    });

    return result?.users.map((e) => ({ walletAddress: e.address, citizens: [...e.token] })) ?? [];
  }

  async getUserCitizens(walletAddress: string): Promise<IGQLCivilizationToken[]> {
    walletAddress = walletAddress.toLowerCase();

    const query = gql`
      query ($walletAddress: ID!) {
        users(where: {address: $walletAddress}) {
          token(first: 1000) {
            id
            tokenId
            caveId
          }
        }
      }
    `;

    const result = await this.client.request(query, {
      walletAddress,
    });

    if (result.users[0]?.token == null) {
      return [];
    }

    return [...result.users[0].token];
  }

  async getAllCitizensOwners(): Promise<ICivilizationSegmentOwner[]> {
    const result: ICivilizationSegmentOwner[] = [];
    const skipAmount = 1000;

    const query = gql`
      query ($skipUsersAmount: Int!, $skipTokensAmount: Int!) {
        users(first: 1000, skip: $skipUsersAmount) {
          id
          token(first: 1000, skip: $skipTokensAmount) {
            id
            tokenId
            caveId
          }
        }
      }
    `;

    let skipUsersAmount = 0;

    do {
      let skipTokensAmount = 0;
      let isUsersHasTokens = true;

      do {
        const { users }: { users: IGQLCivilizationUser[] } = await this.client.request(query, {
          skipUsersAmount,
          skipTokensAmount,
        });

        const usersWithTokes = users.filter((user) => user.token.length > 0);

        if (usersWithTokes.length === 0) {
          isUsersHasTokens = false;
        }

        for (const user of usersWithTokes) {
          const existingUser = result.find((e) => e.walletAddress === user.id);

          if (existingUser != null) {
            existingUser.citizens = [...existingUser.citizens, ...user.token];
            continue;
          }

          result.push({
            walletAddress: user.id,
            citizens: user.token,
          });
        }

        skipTokensAmount += skipAmount;
      } while (isUsersHasTokens);
      skipUsersAmount += skipAmount;
    } while (result.length % skipAmount === 0 && result.length !== 0);

    return result;
  }
}
