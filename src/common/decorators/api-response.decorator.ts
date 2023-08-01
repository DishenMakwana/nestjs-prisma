import { SetMetadata, applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

export function ApiOperationResponse(
  operation: string,
  statusCode: number,
  description: string,
  responseType?: any,
  isArray = false
) {
  return applyDecorators(
    SetMetadata('success_message', description),
    ApiOperation({
      summary: operation,
      description: description,
      operationId: operation,
    }),
    ApiResponse({
      status: statusCode || 200,
      description: description || 'Success',
      type: responseType ?? undefined,
      isArray: isArray,
    })
  );
}
