import { Body, Controller, Post, Route, SuccessResponse, Tags } from '@tsoa/runtime';
import { inject } from 'inversify';
import { Types } from '../configs/ioc.types';
import { IUserService } from '../services/IUserService';
import { provide } from 'inversify-binding-decorators';

interface SignupRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

interface LoginRequest {
  email: string;
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
    const user = await this.userService.signup(body.email, body.password, body.first_name, body.last_name);
    this.setStatus(201);
    return { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name, createdAt: user.createdAt };
  }

  @Post('login')
  public async login(@Body() body: LoginRequest) {
    const user = await this.userService.login(body.email, body.password);
    if (!user) {
      this.setStatus(401);
      return { message: 'Invalid credentials' };
    }
    return { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name };
  }
}
