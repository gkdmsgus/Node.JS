import {Get, Tags, Route} from 'tsoa';

@Route('api/test')
@Tags('Test')
export class TestController {
  @Get('/')
  public async getTest(): Promise<string> {
    return 'Hello from Test Controller!';
  }
}