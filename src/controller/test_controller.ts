import {Controller, Get, Post, Tags, Route, Body, SuccessResponse, Response} from 'tsoa';

interface TestResponse {
  message: string;
  timestamp: string;
}

interface UserInfo {
  userName: string;
  age?: number;
}

@Route('api/test')
@Tags('Test Controller')
export class TestController extends Controller {
  /**
   * 기본 테스트 API
   *
   * @summary 서버 연결 테스트
   * @returns 테스트 메시지
   */
  @Get('/')
  @SuccessResponse('200', 'API 테스트 성공')
  public async getTest(): Promise<TestResponse> {
    return {
      message: 'Hello from Test Controller!',
      timestamp: new Date().toISOString()
    };
  }

  /**
   * POST 요청 테스트 API
   *
   * @summary 유저 정보 테스트
   * @param body 유저 정보
   * @returns 유저 정보 응답
   */
  @Post('/user')
  @SuccessResponse('200', '유저 정보 처리 성공')
  @Response(400, 'Bad Request - 유저 이름이 필요합니다')
  @Response(500, 'Internal Server Error')
  public async testUserInfo(
    @Body() body: UserInfo
  ): Promise<TestResponse> {
    if (!body.userName || body.userName === '') {
      this.setStatus(400);
      throw new Error('유저 이름이 필요합니다.');
    }

    return {
      message: `안녕하세요, ${body.userName}님! ${body.age ? `나이: ${body.age}세` : ''}`,
      timestamp: new Date().toISOString()
    };
  }
}