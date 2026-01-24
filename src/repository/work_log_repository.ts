import prisma from '../config/prisma';
import { user_alba_schedule_day_of_week, user_work_log_status } from '@prisma/client';

/**
 * 요일 매핑 (Date.getDay() → DB enum)
 */
const DAY_OF_WEEK_MAP: Record<number, user_alba_schedule_day_of_week> = {
  0: 'SUN',
  1: 'MON',
  2: 'TUE',
  3: 'WED',
  4: 'THU',
  5: 'FRI',
  6: 'SAT',
};

/**
 * Work Log Repository
 * 근무 스케줄 관련 데이터베이스 접근 계층
 */
class WorkLogRepository {
  /**
   * 특정 날짜의 사용자 근무 스케줄 조회
   * @param userId - 사용자 ID (Binary(16) UUID)
   * @param date - 조회할 날짜
   * @returns 근무 스케줄 목록
   */
  async findSchedulesByDate(
    userId: Uint8Array,
    date: Date,
  ): Promise<
    {
      user_alba_schedule_id: Uint8Array;
      user_id: Uint8Array;
      workplace: string | null;
      work_date: string | null;
      work_time: string | null;
      day_of_week: user_alba_schedule_day_of_week | null;
      repeat_type: 'none' | 'daily' | 'weekly' | 'biweekly' | null;
      hourly_wage: number | null;
      memo: string | null;
    }[]
  > {
    // 오늘 날짜 문자열 (YYYY-MM-DD)
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const dateString = `${year}-${month}-${day}`;

    // 오늘 요일
    const todayDayOfWeek = DAY_OF_WEEK_MAP[date.getDay()];

    return await prisma.user_alba_schedule.findMany({
      where: {
        user_id: userId as Uint8Array<ArrayBuffer>,
        OR: [
          // 특정 날짜 스케줄
          { work_date: dateString },
          // 매일 반복
          { repeat_type: 'daily' },
          // 매주/격주 반복 + 오늘 요일
          {
            repeat_type: { in: ['weekly', 'biweekly'] },
            day_of_week: todayDayOfWeek,
          },
        ],
      },
    });
  }

  /**
   * 특정 스케줄의 오늘 근무 상태 조회
   * @param scheduleId - 스케줄 ID
   * @param date - 조회할 날짜
   * @returns 근무 상태 (없으면 null)
   */
  async findWorkLogStatus(
    scheduleId: Uint8Array,
    date: Date,
  ): Promise<user_work_log_status | null> {
    // 날짜 범위 설정 (해당 날짜의 00:00:00 ~ 23:59:59)
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const workLog = await prisma.user_work_log.findFirst({
      where: {
        user_alba_schedule_id: scheduleId as Uint8Array<ArrayBuffer>,
        work_date: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
      select: {
        status: true,
      },
    });

    return workLog?.status || null;
  }
}

export default new WorkLogRepository();
