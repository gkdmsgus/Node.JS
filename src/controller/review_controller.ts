import {
  Controller,
  Get,
  Put,
  Delete,
  Route,
  Tags,
  Path,
  Body,
  Query,
  SuccessResponse,
  Response,
  Security,
  Request,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import ReviewService from '../service/review_service';
import {
  ReviewResponseDto,
  ReviewListResponseDto,
  UpdateReviewRequestDto,
} from '../DTO/review_dto';
import { TsoaSuccessResponse } from '../config/response_interface';
import { uuidToBuffer } from '../util/uuid_util';

/**
 * Review Controller
 * 내 리뷰 모아보기 API
 */
@Route('api/users')
@Tags('Review')
export class ReviewController extends Controller {
  /**
   * 내 리뷰 목록 조회
   * @param req Express Request (JWT에서 userId 추출)
   * @param sort - 정렬 방식 ('latest' = 최신순, 'oldest' = 오래된순)
   * @returns 리뷰 목록
   */
  @Get('me/reviews')
  @Security('jwt')
  @SuccessResponse('200', '리뷰 목록 조회 성공')
  @Response(401, 'Unauthorized')
  @Response(404, 'User Not Found')
  @Response(500, 'Internal Server Error')
  public async getMyReviews(
    @Request() req: ExpressRequest,
    @Query() sort: 'latest' | 'oldest' = 'latest',
  ): Promise<TsoaSuccessResponse<ReviewListResponseDto>> {
    const userId = (req.user as unknown as { id: string }).id;
    const userIdBuffer = uuidToBuffer(userId);
    const orderBy = sort === 'latest' ? 'desc' : 'asc';

    const reviews = await ReviewService.getReviewsByUserId(userIdBuffer, orderBy);

    return new TsoaSuccessResponse(reviews);
  }

  /**
   * 리뷰 수정
   * @param req Express Request (JWT에서 userId 추출)
   * @param reviewId - 리뷰 ID (UUID 문자열)
   * @param requestBody - 수정할 리뷰 데이터
   * @returns 수정된 리뷰 정보
   */
  @Put('me/reviews/{reviewId}')
  @Security('jwt')
  @SuccessResponse('200', '리뷰 수정 성공')
  @Response(400, 'Bad Request')
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden - 본인의 리뷰만 수정 가능')
  @Response(404, 'Review Not Found')
  @Response(500, 'Internal Server Error')
  public async updateReview(
    @Request() req: ExpressRequest,
    @Path() reviewId: string,
    @Body() requestBody: UpdateReviewRequestDto,
  ): Promise<TsoaSuccessResponse<ReviewResponseDto>> {
    const userId = (req.user as unknown as { id: string }).id;
    const userIdBuffer = uuidToBuffer(userId);
    const reviewIdBuffer = uuidToBuffer(reviewId);

    const review = await ReviewService.updateReview(reviewIdBuffer, userIdBuffer, requestBody);

    return new TsoaSuccessResponse(review);
  }

  /**
   * 리뷰 삭제
   * @param req Express Request (JWT에서 userId 추출)
   * @param reviewId - 리뷰 ID (UUID 문자열)
   */
  @Delete('me/reviews/{reviewId}')
  @Security('jwt')
  @SuccessResponse('200', '리뷰 삭제 성공')
  @Response(401, 'Unauthorized')
  @Response(403, 'Forbidden - 본인의 리뷰만 삭제 가능')
  @Response(404, 'Review Not Found')
  @Response(500, 'Internal Server Error')
  public async deleteReview(
    @Request() req: ExpressRequest,
    @Path() reviewId: string,
  ): Promise<TsoaSuccessResponse<{ message: string }>> {
    const userId = (req.user as unknown as { id: string }).id;
    const userIdBuffer = uuidToBuffer(userId);
    const reviewIdBuffer = uuidToBuffer(reviewId);

    await ReviewService.deleteReview(reviewIdBuffer, userIdBuffer);

    return new TsoaSuccessResponse({ message: '리뷰가 삭제되었습니다.' });
  }
}
