import prisma from '../config/prisma';

/**
 * Schedule Repository
 * 알바 일정 관련 데이터베이스 접근 계층
 */
class ScheduleRepository {
  /**
   * 새 알바 일정 생성
   * @param data - 일정 생성에 필요한 데이터
   * @returns 생성된 일정 정보
   */
  async createSchedule(data: {
    user_id: Uint8Array;
    workplace: string;
    work_date: string;
    work_time: string;
    hourly_wage: number;
    memo?: string;
  }) {
    return await prisma.user_alba_schedule.create({
      data: {
        user_id: data.user_id as Uint8Array<ArrayBuffer>,
        workplace: data.workplace,
        work_date: data.work_date,
        work_time: data.work_time,
        hourly_wage: data.hourly_wage,
        memo: data.memo || null,
        // 홈화면 간단 추가는 반복 없음으로 설정
        repeat_type: 'none',
      },
    });
  }

  /**
   * 일정 생성 + work_log 동시 생성 (트랜잭션)
   * 홈 리스트에 노출되도록 user_work_log도 함께 생성
   */
  async createScheduleWithWorkLog(
    scheduleData: {
      user_id: Uint8Array;
      workplace: string;
      work_date: string;
      work_time: string;
      hourly_wage: number;
      memo?: string;
    },
    workLogData: {
      workDate: Date;
      startTime: Date | null;
      endTime: Date | null;
      workMinutes: number | null;
    },
  ) {
    return await prisma.$transaction(async (tx) => {
      // 1. 일정 생성
      const schedule = await tx.user_alba_schedule.create({
        data: {
          user_id: scheduleData.user_id as Uint8Array<ArrayBuffer>,
          workplace: scheduleData.workplace,
          work_date: scheduleData.work_date,
          work_time: scheduleData.work_time,
          hourly_wage: scheduleData.hourly_wage,
          memo: scheduleData.memo || null,
          repeat_type: 'none',
        },
      });

      // 2. work_log 생성 (schedule_id 연결)
      await tx.user_work_log.create({
        data: {
          user_id: scheduleData.user_id as Uint8Array<ArrayBuffer>,
          user_alba_schedule_id: schedule.user_alba_schedule_id,
          work_date: workLogData.workDate,
          start_time: workLogData.startTime,
          end_time: workLogData.endTime,
          work_minutes: workLogData.workMinutes,
          status: 'scheduled',
        },
      });

      return schedule;
    });
  }

  /**
   * 일정 ID로 일정 조회
   * @param scheduleId - 일정 ID (Binary UUID)
   * @returns 일정 정보
   */
  async findScheduleById(scheduleId: Uint8Array) {
    return await prisma.user_alba_schedule.findUnique({
      where: { user_alba_schedule_id: scheduleId as Uint8Array<ArrayBuffer> },
    });
  }

  /**
   * 사용자의 특정 날짜 일정 목록 조회
   * @param userId - 사용자 ID
   * @param workDate - 근무 날짜 (YYYY-MM-DD 형식)
   * @returns 일정 목록
   */
  async findSchedulesByUserIdAndDate(userId: Uint8Array, workDate: string) {
    return await prisma.user_alba_schedule.findMany({
      where: {
        user_id: userId as Uint8Array<ArrayBuffer>,
        work_date: workDate,
      },
    });
  }
}

export default new ScheduleRepository();
