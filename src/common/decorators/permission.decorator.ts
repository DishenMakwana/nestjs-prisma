import { SetMetadata } from '@nestjs/common';

export const Permission = (permission: string) => {
  return SetMetadata('permission', permission);
};
