// settlement.repository.ts
import { Prisma } from '@prisma/client';
import prisma from '../config/prisma'; // TODO: 프로젝트 경로에 맞게 수정
import { SettlementListResponseDTO } from '../DTO/settlement_dto';

type DbSettlementStatus = 'waiting' | 'paid' | 'unpaid';

export interface FindMySettlementsArgs {
  userId: string; // UUID string
  settlementStatus?: DbSettlementStatus; // undefined면 전체(all)
  orderBy: 'latest' | 'oldest';
  cursor?: string; // user_work_log_id (UUID string)
  size: number;
}

/**
 * Binary(16) UUID 변환 유틸
 * - 스키마에서 uuid_to_bin(uuid())를 swap 옵션 없이 썼으므로 (기본 swap=0) 일반 변환으로 처리
 */
function uuidToBin(uuid: string): Buffer {
  const hex = uuid.replace(/-/g, '');
  if (hex.length !== 32) throw new Error('Invalid UUID format');
  return Buffer.from(hex, 'hex');
}

function binToUuid(bin: Buffer): string {
  const hex = bin.toString('hex');
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-');
}

export class SettlementRepository {
  public async findMySettlements(args: FindMySettlementsArgs): Promise<SettlementListResponseDTO> {
    const { userId, settlementStatus, orderBy, cursor, size } = args;

    const userIdBin = uuidToBin(userId);

    // 정렬
    const sortDir: 'asc' | 'desc' = orderBy === 'latest' ? 'desc' : 'asc';

    /**
     * where 구성
     * - 기본: 내 work_log만
     * - settlementStatus가 있으면: user_alba(내 것)에서 settlement_status 조건을 만족하는 posting의 work_log만
     */
    const where: Prisma.user_work_logWhereInput = {
      userId: userIdBin,
      ...(settlementStatus
        ? {
            alba_posting: {
              user_alba: {
                some: {
                  user_id: userIdBin,
                  settlement_status: settlementStatus,
                },
              },
            },
          }
        : {}),
    };

    /**
     * 커서 페이징:
     * - cursor는 user_work_log_id(UUID)를 받는다고 가정
     * - take = size + 1로 hasNext 판단
     */
    const take = size + 1;
    const cursorClause = cursor
      ? {
          cursor: { user_work_log_id: uuidToBin(cursor) },
          skip: 1,
        }
      : {};

    const logs = await prisma.user_work_log.findMany({
      where,
      ...cursorClause,
      take,
      orderBy: [
        { work_date: sortDir },
        { user_work_log_id: sortDir }, // tie-breaker
      ],
      include: {
        // 실제수입: income_log (여러 개일 수 있으니 합산)
        income_log: {
          select: { amount: true },
        },
        alba_posting: {
          select: {
            hourly_rate: true,
            store: {
              select: { store_name: true },
            },
            // 정산상태: user_alba에서 (내 user_id 기준 1개만)
            user_alba: {
              where: { user_id: userIdBin },
              select: { settlement_status: true },
            },
          },
        },
      },
    });

    const hasNext = logs.length > size;
    const sliced = hasNext ? logs.slice(0, size) : logs;

    const items = sliced.map((log) => {
      const workDate =
        log.work_date instanceof Date
          ? log.work_date.toISOString().slice(0, 10)
          : log.work_date
            ? String(log.work_date)
            : '';

      const storeName = log.alba_posting?.store?.store_name ?? '';
      const minutes = log.work_minutes ?? 0;

      const hourlyRate = log.alba_posting?.hourly_rate ?? 0;

      // ⚠️ work_minutes는 분 단위. 시급은 시간 단위.
      // 예상수입 = hourly_rate * (minutes / 60)
      const expectedIncome = Math.floor((hourlyRate * minutes) / 60);

      // income_log 여러 건이면 합산
      const amount = (log.income_log ?? []).reduce((sum, x) => sum + (x.amount ?? 0), 0);

      // user_alba는 (user_id, alba_id) 1개일 것이므로 첫 번째 사용
      const settlement_status =
        (log.alba_posting?.user_alba?.[0]?.settlement_status as DbSettlementStatus | undefined) ??
        'unpaid';

      return {
        work_date: workDate,
        store_name: storeName,
        work_minutes: minutes,
        expected_income: expectedIncome,
        amount,
        settlement_status,
      };
    });

    // nextCursor는 마지막 항목의 user_work_log_id를 내려주면 됨
    const nextCursor =
      hasNext && sliced.length > 0
        ? binToUuid(sliced[sliced.length - 1].user_work_log_id as unknown as Buffer)
        : undefined;

    return {
      items,
      hasNext,
      ...(nextCursor ? { nextCursor } : {}),
    };
  }
}

export const settlementRepository = new SettlementRepository();
