import AlbaRecommendRepository from '../repository/alba_recommend_repository';
import { RecommendedAlbaDto } from '../DTO/alba_recommend_dto';
import { bufferToUuid } from '../util/uuid_util';

class AlbaRecommendService {
  async getRecommendedPostings(userId: Uint8Array): Promise<RecommendedAlbaDto[]> {
    const postings = await AlbaRecommendRepository.findRecommendedPostings(userId);

    return postings.map((posting) => ({
      albaId: bufferToUuid(posting.alba_id),
      storeName: posting.store.store_name,
      storeAddress: posting.store.store_address,
      hourlyRate: posting.hourly_rate,
      totalWage: posting.total_wage,
      mainTask: posting.main_task,
      regionCity: posting.region?.city ?? null,
      regionDistrict: posting.region?.district ?? null,
    }));
  }
}

export default new AlbaRecommendService();
