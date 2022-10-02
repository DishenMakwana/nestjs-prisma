import { PrismaClient } from '@prisma/client';

export const softDeleteModels = ['User', 'Job'];

export const PrismaSoftDeleteMiddleware = (prisma: PrismaClient) => {
  /**
   * soft delete a value
   */
  prisma.$use(async (params: any, next) => {
    if (softDeleteModels.includes(params.model)) {
      if (params.action == 'delete') {
        // Delete queries
        // Change action to an update
        params.action = 'update';
        params.args['data'] = { deleted_at: new Date() };
      }
      if (params.action == 'deleteMany') {
        // Delete many queries
        params.action = 'updateMany';
        if (params.args.data != undefined) {
          params.args.data['deleted_at'] = new Date();
        } else {
          params.args['data'] = { deleted_at: new Date() };
        }
      }
    }
    return next(params);
  });

  /**
   * Exclude deleted values from find queries
   */
  prisma.$use(async (params: any, next) => {
    if (softDeleteModels.includes(params.model)) {
      if (params.action == 'findUnique') {
        // Change to findFirst - you cannot filter
        // by anything except ID / unique with findUnique
        params.action = 'findFirst';
        // Add 'deleted' filter
        // ID filter maintained
        //   params.args.where["deleted"] = false;
        params.args['where'] = {
          ...params.args['where'],
          deleted_at: null,
        };
      }
      if (params.action == 'findMany' || params.action == 'findFirst') {
        // Find many queries
        if (params.args.where != false) {
          if (params.args.where.deleted_at == undefined) {
            // Exclude deleted records if they have not been explicitly requested
            params.args['where'] = {
              ...params.args['where'],
              deleted_at: null,
            };
          }
        } else {
          params.args['where'] = {
            ...params.args['where'],
            deleted_at: null,
          };
        }
      }
    }
    return next(params);
  });

  /**
   * Exclude deleted values from update queries
   */
  prisma.$use(async (params: any, next) => {
    if (softDeleteModels.includes(params.model)) {
      if (params.action == 'update') {
        // Change to updateMany - you cannot filter
        // by anything except ID / unique with findUnique
        params.action = 'updateMany';
        // Add 'deleted' filter
        // ID filter maintained
        params.args['where'] = {
          ...params.args['where'],
          deleted_at: null,
        };
      }
      if (params.action == 'updateMany') {
        if (params.args.where != undefined) {
          params.args['where'] = {
            ...params.args['where'],
            deleted_at: null,
          };
        } else {
          params.args['where'] = {
            ...params.args['where'],
            deleted_at: null,
          };
        }
      }
    }
    return next(params);
  });
};
