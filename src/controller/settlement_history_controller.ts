import {
  Controller,
  Get,
  Route,
  Tags,
  Query,
  SuccessResponse,
  Response,
  Security,
  Request,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import SettlementHistoryService from '../service/settlement_history_service';
import { SettlementHistoryResponseDto } from '../DTO/settlement_history_dto';
import { TsoaSuccessResponse } from '../config/response_interface';
import { uuidToBuffer } from '../util/uuid_util';

/**
 * 정산 내역 Controller
 * 설정 > 정산 내역 확인
 */
@Route('api/settlement-history')
@Tags('Settlement History')
export class SettlementHistoryController extends Controller {
  /**
   * 정산 내역 조회 API
   * @param req Express Request (JWT에서 userId 추출)
   * @param status 정산 상태 필터 (all: 전체, waiting: 정산 대기, paid: 정산 완료, unpaid: 미정산)
   * @returns 정산 내역 목록
   */
  @Get('me')
  @Security('jwt')
  @SuccessResponse('200', '정산 내역 조회 성공')
  @Response(401, 'Unauthorized')
  @Response(500, 'Internal Server Error')
  public async getSettlementHistory(
    @Request() req: ExpressRequest,
    @Query() status: 'all' | 'waiting' | 'paid' | 'unpaid' = 'all',
  ): Promise<TsoaSuccessResponse<SettlementHistoryResponseDto>> {
    const userId = (req.user as unknown as { id: string }).id;
    const userIdBuffer = uuidToBuffer(userId);

    const history = await SettlementHistoryService.getSettlementHistory(userIdBuffer, status);

    return new TsoaSuccessResponse(history);
  }
}
