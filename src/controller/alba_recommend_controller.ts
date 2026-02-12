import { Controller, Route, Get, Security, Request, SuccessResponse, Response, Tags } from 'tsoa';
import { Request as ExpressRequest } from 'express';
import AlbaRecommendService from '../service/alba_recommend_service';
import { TsoaSuccessResponse } from '../config/response_interface';
import { RecommendedAlbaDto } from '../DTO/alba_recommend_dto';
import { uuidToBuffer } from '../util/uuid_util';

@Route('api/alba/recommend')
@Tags('Alba Recommend')
export class AlbaRecommendController extends Controller {
  /**
   * 홈 화면 추천 알바공고 조회 API
   * 유저의 선호 지역과 일치하는 알바공고를 최대 3개 추천
   */
  @Get('')
  @Security('jwt')
  @SuccessResponse('200', '조회 성공')
  @Response(401, 'Unauthorized')
  public async getRecommendedAlba(
    @Request() req: ExpressRequest,
  ): Promise<TsoaSuccessResponse<RecommendedAlbaDto[]>> {
    const userId = (req.user as unknown as { id: string }).id;
    const userIdBuffer = uuidToBuffer(userId);

    const result = await AlbaRecommendService.getRecommendedPostings(userIdBuffer);
    return new TsoaSuccessResponse(result);
  }
}
