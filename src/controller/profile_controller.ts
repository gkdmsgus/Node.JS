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
import ProfileService from '../service/profile_service';
import { ProfileResponseDto, UpdateProfileRequestDto } from '../DTO/profile_dto';
import { TsoaSuccessResponse } from '../config/response_interface';
import { uuidToBuffer } from '../util/uuid_util';

/**
 * Profile Controller
 * 프로필 조회 및 수정 API
 */
@Route('api/profile')
@Tags('Profile')
export class ProfileController extends Controller {
  /**
   * 프로필 조회
   * @param req Express Request (JWT에서 userId 추출)
   * @returns 프로필 정보
   */
  @Get('me')
  @Security('jwt')
  @SuccessResponse('200', '프로필 조회 성공')
  @Response(401, 'Unauthorized')
  @Response(404, 'User Not Found')
  @Response(500, 'Internal Server Error')
  public async getProfile(
    @Request() req: ExpressRequest,
  ): Promise<TsoaSuccessResponse<ProfileResponseDto>> {
    const userId = (req.user as unknown as { id: string }).id;
    const userIdBuffer = uuidToBuffer(userId);
    const profile = await ProfileService.getProfile(userIdBuffer);
    return new TsoaSuccessResponse(profile);
  }

  /**
   * 프로필 수정
   * @param req Express Request (JWT에서 userId 추출)
   * @param requestBody - 수정할 프로필 데이터
   * @returns 수정된 프로필 정보
   */
  @Put('me')
  @Security('jwt')
  @SuccessResponse('200', '프로필 수정 성공')
  @Response(400, 'Bad Request')
  @Response(401, 'Unauthorized')
  @Response(404, 'User Not Found')
  @Response(500, 'Internal Server Error')
  public async updateProfile(
    @Request() req: ExpressRequest,
    @Body() requestBody: UpdateProfileRequestDto,
  ): Promise<TsoaSuccessResponse<ProfileResponseDto>> {
    const userId = (req.user as unknown as { id: string }).id;
    const userIdBuffer = uuidToBuffer(userId);
    const profile = await ProfileService.updateProfile(userIdBuffer, requestBody);
    return new TsoaSuccessResponse(profile);
  }
}
