import { Body, Controller, Post, Route, SuccessResponse, Tags } from '@tsoa/runtime';
import { inject } from 'inversify';
import { Types } from '../configs/ioc.types';
import { IUserService } from '../services/IUserService';
import { provide } from 'inversify-binding-decorators';

interface SignupRequest {
  username: string;
  password: string;
}

interface LoginRequest {
  username: string;
  password: string;
}

@provide(UserController)
@Route('users')
@Tags('User')
export class UserController extends Controller {
  constructor(
    @inject(Types.IUserService) private userService: IUserService
  ) {
    super();
  }

  @SuccessResponse('201', 'Created')
  @Post('signup')
  public async signup(@Body() body: SignupRequest) {
    const user = await this.userService.signup(body.username, body.password);
    this.setStatus(201);
    return { id: user.id, username: user.username, createdAt: user.createdAt };
  }

  @Post('login')
  public async login(@Body() body: LoginRequest) {
    const user = await this.userService.login(body.username, body.password);
    if (!user) {
      this.setStatus(401);
      return { message: 'Invalid credentials' };
    }
    return { id: user.id, username: user.username };
  }
}
