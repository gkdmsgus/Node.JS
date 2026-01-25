import { Get, Tags, Route, SuccessResponse } from 'tsoa';
import prisma from '../config/prisma';
import { TsoaSuccessResponse } from '../config/response_interface';
import { generateTokens } from '../config/jwt';

@Route('api/test')
@Tags('Test')
export class TestController {
  /**
   *
   * @returns 테스트 유저의 액세스 토큰
   */
  @Get('/')
  @SuccessResponse('200', 'Success')
  public async getTest(): Promise<TsoaSuccessResponse<string>> {
    const testUser = await prisma.user.findFirst({
      where: {
        user_name: 'test_user',
      },
    });

    const { accessToken } = await generateTokens({
      id: testUser.user_id,
      email: testUser.email,
    });

    return new TsoaSuccessResponse(accessToken);
  }
}
