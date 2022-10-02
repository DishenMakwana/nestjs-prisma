import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class RTGuard extends AuthGuard('jwt-refresh') {
  constructor() {
    super();
  }
}
