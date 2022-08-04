/* eslint-disable no-continue */
/* eslint-disable no-await-in-loop */
import { Injectable, NotFoundException } from '@nestjs/common';
import { gql, GraphQLClient } from 'graphql-request';
import { ApiConfigService } from '../infrastructure/config/api-config.service';

import { ErrorMessages } from '../infrastructure/config/constants/error-messages.constant';

import { IGQLSegment } from './interface/gql-segment.interface';
import { IGQLUser } from './interface/gql-user.interface';
import { ISegmentOwner } from './interface/segment-owner.interface';
import { ISegmentsWithOwner } from './interface/segments-with-owners.interface';
import { TokenTransfer } from './interface/token-transfer.interface';

/**
 * Service for working with smart-contract data by graphQL.
 *
 * Retrieves info from TheGraph
 * @see {@link https://thegraph.com/docs/en/ TheGraph}
 */
@Injectable()
export class GraphQLService {
  private readonly client = new GraphQLClient(this.configService.graphURI);

  constructor(
    private readonly configService: ApiConfigService,
  ) {}

  /**
   * Method to get owners to each segment of array
   *
   * @param segmentIds array of segments ids
   * @returns segments with their owner
   */
  async getSegmentsOwnersByIds(segmentIds: number[]): Promise<ISegmentsWithOwner[]> {
    const query = gql`
      query ($segmentIds: [ID!]!) {
        tokens(where: { id_in: $segmentIds }, first: 1000) {
          id
          coordinate
          owner {
            id
          }
        }
      }
    `;

    const result = await this.client.request(query, {
      segmentIds,
    });

    return result.tokens;
  }

  /**
   * Method to get info from smart-contract of ETH blockchain.
   * Retrieves information about token transfers between accounts
   *
   * @param limit request's limit
   * @param offset request's offset
   * @returns token transfers info. From address, to address, timestamp and token id.
   */
  async getTokenTransfers(limit = 20, offset = 0): Promise<TokenTransfer[]> {
    const query = gql`
      query ($limit: Int!, $offset: Int!) {
        transfers(orderBy: timestamp, orderDirection: desc, skip: $offset, first: $limit) {
          timestamp
          from {
            id
          }
          to {
            id
          }
          token {
            id
            coordinate
          }
        }
      }
    `;

    const { transfers } = await this.client.request(query, { limit, offset });

    return transfers;
  }

  /**
   * Method to get current segment owner ETH wallet address by its id
   *
   * @param segmentId NFT segment's smart-contract id
   * @returns segment's owner wallet address
   */
  async getSegmentOwner(segmentId: number): Promise<string> {
    const query = await this.client.request(gql`
      query ($segmentId: ID!) {
        artworks(first: 1) {
          tokens(where: { id: $segmentId }) {
            id
            owner {
              id
            }
          }
        }
      }
    `, {
      segmentId,
    });

    const segments = query.artworks[0].tokens;

    if (!segments[0] || !segments[0].owner) {
      throw new NotFoundException(ErrorMessages.SEGMENT_NOT_FOUND);
    }

    const ownerId = segments[0]?.owner?.id;

    return ownerId;
  }

  /**
   * Method to get all currently owned NFT's in blockchain by wallet address
   *
   * @param walletAddress user's wallet address in ETH blockchain
   * @returns NFT segment's smart-contract id and coordinate
   */
  async getUserSegments(walletAddress: string): Promise<IGQLSegment[]> {
    walletAddress = walletAddress.toLowerCase();
    const userSegments = [];
    const skipAmount = 1000;
    let skip = 0;

    const query = gql`
      query ($walletAddress: ID!, $skip: Int!) {
        artworks {
          tokens(
            first: 1000
            skip: $skip
            where: { owner: $walletAddress }
          ) {
            id
            coordinate
          }
        }
      }
    `;

    do {
      const result = await this.client.request(query, {
        walletAddress,
        skip,
      });

      userSegments.push(...result.artworks[0].tokens);
      skip += skipAmount;
    } while (userSegments.length % skipAmount === 0 && userSegments.length !== 0);

    return userSegments;
  }

  /**
   * Method to retrieve info from ETH blockchain.
   * It gets all currently owners and their NFT segments
   *
   * @param orderType ASC or DESC
   * @param limit request's limit
   * @returns array of wallet address owners and their NFT segments with id and coordinate
   */
  async getAllSegmentsOwners(orderType?: 'ASC' | 'DESC', limit?: number): Promise<ISegmentOwner[]> {
    const result: ISegmentOwner[] = [];
    const skipAmount = 1000;

    const query = gql`
      query ($skipUsersAmount: Int!, $skipTokensAmount: Int!) {
        users(first: 1000, skip: $skipUsersAmount) {
          id
          tokens(first: 1000, skip: $skipTokensAmount) {
            id
            coordinate
          }
        }
      }
    `;

    let skipUsersAmount = 0;

    do {
      let skipTokensAmount = 0;
      let isUsersHasTokens = true;

      do {
        const { users }: { users: IGQLUser[] } = await this.client.request(query, {
          skipUsersAmount,
          skipTokensAmount,
        });

        const usersWithTokes = users.filter((user) => user.tokens.length > 0);

        if (usersWithTokes.length === 0) {
          isUsersHasTokens = false;
        }

        for (const user of usersWithTokes) {
          const index = result.findIndex((e) => e.walletAddress === user.id);

          if (index !== -1) {
            result[index].segments = [...result[index].segments, ...user.tokens];
            continue;
          }

          result.push({
            walletAddress: user.id,
            segments: user.tokens,
          });
        }

        skipTokensAmount += skipAmount;
      } while (isUsersHasTokens);
      skipUsersAmount += skipAmount;
    } while (result.length % skipAmount === 0 && result.length !== 0);

    if (orderType != null) {
      result.sort((userOne, userTwo) => {
        if (userOne.segments.length > userTwo.segments.length) {
          return orderType === 'ASC' ? 1 : -1;
        }

        return orderType === 'ASC' ? -1 : 1;
      });
    }

    if (limit) {
      return result.slice(0, limit);
    }

    return result;
  }
}
