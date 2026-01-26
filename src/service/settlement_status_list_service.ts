import { SettlementListResponseDTO } from '../DTO/settlement_status_list_dto';
import {
  SettlementStatusQuery,
  SettlementSortQuery,
} from '../controller/settlement_status_list_controller';
// import { settlementRepository } from '../repositories/settlement.repository';

interface ListMySettlementsParams {
  status: SettlementStatusQuery;
  sort: SettlementSortQuery;
  cursor?: string;
  size: number;
}

class SettlementService {
  /**
   * 내 정산 상태 목록 조회
   */
  public async listMySettlements(
    userId: string,
    params: ListMySettlementsParams,
  ): Promise<SettlementListResponseDTO> {
    const { status, sort, cursor, size } = params;

    const settlementStatusFilter = status === 'all' ? undefined : status;

    const orderBy =
      sort === 'latest' ? { work_date: 'desc' as const } : { work_date: 'asc' as const };

    const pageSize = Math.min(size, 20);

    // const result = await settlementRepository.findMySettlements({
    //   userId,
    //   settlementStatus: settlementStatusFilter,
    //   orderBy,
    //   cursor,
    //   size: pageSize,
    // });

    return {
      items: [],
      hasNext: false,
    };
  }
}

export const settlementService = new SettlementService();
