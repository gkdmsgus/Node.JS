import cron from 'node-cron';
import WorkLogService from '../service/work_log_service';

/**
 * Work Log Scheduler
 * 퇴근 시간이 지난 근무 기록을 자동으로 done 상태로 변경
 */

/**
 * 스케줄러 초기화
 * 매 분마다 실행하여 퇴근 시간이 지난 working 상태의 근무 기록을 done으로 변경
 */
export function initWorkLogScheduler(): void {
  // 매 분마다 실행 (* * * * *)
  cron.schedule('* * * * *', async () => {
    try {
      const updatedCount = await WorkLogService.autoCheckOutExpiredLogs();
      if (updatedCount > 0) {
        console.log(`[WorkLogScheduler] ${updatedCount}개의 근무 기록이 자동 퇴근 처리됨`);
      }
    } catch (error) {
      console.error('[WorkLogScheduler] 자동 퇴근 처리 중 오류 발생:', error);
    }
  });

  console.log('[WorkLogScheduler] 스케줄러가 시작되었습니다. (매 분마다 실행)');
}
