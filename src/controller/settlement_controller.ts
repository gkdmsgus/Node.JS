import { Controller, Get, Route, Request, Tags, Query, SuccessResponse, Response } from 'tsoa';
import { SettlementListResponseDTO } from '../DTO/settlement_dto';
import { Request as ExpressRequest } from 'express';

/**
 * settlement Controller
 * 내 정산 상태 목록 조회
 * - status로 탭 필터
 * - sort로 정렬
 */

export type SettlementStatusQuery = 'all' | 'waiting' | 'paid' | 'unpaid';
export type SettlementSortQuery = 'latest' | 'oldest';

@Route('api/settlements')
@Tags('settlement')
export class settlementController extends Controller {
  /**
   * 내 정산 상태 목록 조회
   * @param status 탭 필터 (all | waiting | paid | unpaid)
   * @param sort 정렬 방식 (latest | oldest)
   * @param cursor 커서(페이징)
   * @param size 페이지 크기
   * @returns 정산 상태 목록
   */
  @Get()
  @SuccessResponse('200', '정산 상태 목록 조회 성공')
  @Response(401, 'Unauthorized')
  @Response(500, 'Internal Server Error')
  public async getMysettlements(
    @Request() req: ExpressRequest,
    @Query() status: SettlementStatusQuery = 'all',
    @Query() sort: SettlementSortQuery = 'latest',
    @Query() cursor?: string,
    @Query() size: number = 20,
  ): Promise<SettlementListResponseDTO> {
    const userId = (req as any).userId as string | undefined;

    if (!userId) {
      // 인증 미들웨어가 아직 없거나 userId를 주입하지 못한 경우
      this.setStatus(401);
      return {
        items: [],
        hasNext: false,
      };
    }
    // TODO: Service 연결 후 실제 데이터 반환
    // const result = await settlementService.listMySettlements(userId, { status, sort, cursor, size });
    // return result;

    return {
      items: [],
      hasNext: false,
    };
  }
}
