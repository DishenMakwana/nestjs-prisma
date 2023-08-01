import { SetMetadata } from '@nestjs/common';

export const SuccessMessage = (success_message: string) => {
  return SetMetadata('success_message', success_message);
};
