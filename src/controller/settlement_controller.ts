import {
  Controller,
  Get,
  Put,
  Route,
  Tags,
  Body,
  SuccessResponse,
  Response,
  Security,
  Request,
} from 'tsoa';
import { Request as ExpressRequest } from 'express';
import SettlementService from '../service/settlement_service';
import { SettlementResponseDto, UpdateSettlementRequestDto } from '../DTO/settlement_dto';
import { TsoaSuccessResponse } from '../config/response_interface';
import { uuidToBuffer } from '../util/uuid_util';

/**
 * Settlement Controller
 * 계좌(정산) 정보 API
 */
@Route('api/users')
@Tags('Settlement')
export class SettlementController extends Controller {
  /**
   * 계좌 정보 조회
   * @param req Express Request (JWT에서 userId 추출)
   * @returns 계좌 정보
   */
  @Get('me/settlement')
  @Security('jwt')
  @SuccessResponse('200', '계좌 정보 조회 성공')
  @Response(401, 'Unauthorized')
  @Response(404, 'User Not Found')
  @Response(500, 'Internal Server Error')
  public async getSettlement(
    @Request() req: ExpressRequest,
  ): Promise<TsoaSuccessResponse<SettlementResponseDto>> {
    const userId = (req.user as unknown as { id: string }).id;
    const userIdBuffer = uuidToBuffer(userId);
    const settlement = await SettlementService.getSettlement(userIdBuffer);
    return new TsoaSuccessResponse(settlement);
  }

  /**
   * 계좌 정보 수정
   * @param req Express Request (JWT에서 userId 추출)
   * @param requestBody - 수정할 계좌 정보
   * @returns 수정된 계좌 정보
   */
  @Put('me/settlement')
  @Security('jwt')
  @SuccessResponse('200', '계좌 정보 수정 성공')
  @Response(400, 'Bad Request')
  @Response(401, 'Unauthorized')
  @Response(404, 'User Not Found')
  @Response(500, 'Internal Server Error')
  public async updateSettlement(
    @Request() req: ExpressRequest,
    @Body() requestBody: UpdateSettlementRequestDto,
  ): Promise<TsoaSuccessResponse<SettlementResponseDto>> {
    const userId = (req.user as unknown as { id: string }).id;
    const userIdBuffer = uuidToBuffer(userId);
    const settlement = await SettlementService.updateSettlement(userIdBuffer, requestBody);
    return new TsoaSuccessResponse(settlement);
  }
}
