import { registerEnumType } from '@nestjs/graphql';

export enum SortOrderEnum {
  HIGHEST = 'HIGHEST',
  LOWEST = 'LOWEST',
  NEWEST = 'NEWEST',
  OLDEST = 'OLDEST',
}

registerEnumType(SortOrderEnum, {
  name: 'SortOrderEnum',
});
