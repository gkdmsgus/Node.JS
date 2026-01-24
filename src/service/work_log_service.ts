import WorkLogRepository from '../repository/work_log_repository';
import { TodayScheduleResponseDto, TodayWorkListResponseDto } from '../DTO/work_log_dto';
import { bufferToUuid } from '../util/uuid_util';
import { formatDate } from '../util/date_util';

/**
 * 근무 상태 라벨 매핑
 */
const STATUS_LABELS: Record<string, string> = {
  scheduled: '예정',
  working: '근무 중',
  done: '근무 완료',
  settled: '정산 완료',
};

/**
 * Work Log Service
 * 근무 스케줄 관련 비즈니스 로직 처리
 */
class WorkLogService {
  /**
   * 오늘의 근무 리스트 조회
   * @param userId - 사용자 ID (Buffer 형식)
   * @returns 오늘의 근무 리스트
   */
  async getTodaySchedules(userId: Uint8Array): Promise<TodayWorkListResponseDto> {
    const today = new Date();

    // Repository에서 오늘 날짜 스케줄 가져오기
    const schedules = await WorkLogRepository.findSchedulesByDate(userId, today);

    // DTO 형식으로 변환 (상태 조회 포함)
    const scheduleDtos: TodayScheduleResponseDto[] = await Promise.all(
      schedules.map(async (schedule) => {
        const { startTime, endTime, workHours } = this.parseWorkTime(schedule.work_time);
        const hourlyWage = schedule.hourly_wage || 0;
        const totalWage = Math.round(hourlyWage * workHours);

        // 해당 스케줄의 오늘 근무 상태 조회
        const workLogStatus = await WorkLogRepository.findWorkLogStatus(
          schedule.user_alba_schedule_id,
          today,
        );

        // 상태가 없으면 기본값 'scheduled'
        const status = workLogStatus || 'scheduled';

        return {
          scheduleId: bufferToUuid(schedule.user_alba_schedule_id),
          status,
          statusLabel: STATUS_LABELS[status] || '알 수 없음',
          workplace: schedule.workplace || '',
          startTime,
          endTime,
          workHours,
          hourlyWage,
          totalWage,
        };
      }),
    );

    return {
      date: formatDate(today),
      schedules: scheduleDtos,
      totalCount: scheduleDtos.length,
    };
  }

  /**
   * work_time 문자열 파싱 ("14:00~18:00" → 시작시간, 종료시간, 근무시간)
   * @param workTime - 근무 시간 문자열
   * @returns 파싱된 시간 정보
   */
  private parseWorkTime(workTime: string | null): {
    startTime: string;
    endTime: string;
    workHours: number;
  } {
    if (!workTime) {
      return { startTime: '', endTime: '', workHours: 0 };
    }

    // "14:00~18:00" 또는 "14:00-18:00" 형식 파싱
    const parts = workTime.split(/[~-]/);
    if (parts.length !== 2) {
      return { startTime: workTime, endTime: '', workHours: 0 };
    }

    const startTime = parts[0].trim();
    const endTime = parts[1].trim();

    // 근무 시간 계산
    const workHours = this.calculateWorkHours(startTime, endTime);

    return { startTime, endTime, workHours };
  }

  /**
   * 시작/종료 시간으로 근무 시간 계산
   * @param startTime - 시작 시간 ("14:00")
   * @param endTime - 종료 시간 ("18:00")
   * @returns 근무 시간 (시간 단위)
   */
  private calculateWorkHours(startTime: string, endTime: string): number {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);

    if (isNaN(startHour) || isNaN(endHour)) {
      return 0;
    }

    const startMinutes = startHour * 60 + (startMin || 0);
    let endMinutes = endHour * 60 + (endMin || 0);

    // 자정 넘어가는 경우 (예: 22:00 ~ 02:00)
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }

    const diffMinutes = endMinutes - startMinutes;
    return Math.round((diffMinutes / 60) * 10) / 10; // 소수점 첫째자리
  }
}

export default new WorkLogService();
