import prisma from '../config/prisma';

class AlbaRecommendRepository {
  /**
   * 유저의 선호 지역에 해당하는 알바 공고 최대 3개 조회
   */
  async findRecommendedPostings(userId: Uint8Array) {
    // 1. 유저의 선호 region_id 목록 조회
    const preferredRegions = await prisma.user_preferred_region.findMany({
      where: { user_id: userId as Uint8Array<ArrayBuffer> },
      select: { region_id: true },
    });

    if (preferredRegions.length === 0) {
      return [];
    }

    const regionIds = preferredRegions.map((r) => r.region_id);

    // 2. 해당 region_id에 매칭되는 alba_posting 3개 조회
    const postings = await prisma.alba_posting.findMany({
      where: {
        region_id: { in: regionIds },
      },
      include: {
        store: {
          select: {
            store_name: true,
            store_address: true,
          },
        },
        region: {
          select: {
            city: true,
            district: true,
          },
        },
      },
      take: 3,
    });

    return postings;
  }
}

export default new AlbaRecommendRepository();
