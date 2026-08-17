package com.feemanagement.config;

import com.feemanagement.service.IFeeRecordService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;

@Configuration
@EnableScheduling
@RequiredArgsConstructor
@Slf4j
public class OverdueScheduler {

    private final IFeeRecordService feeRecordService;

    // Runs every day at 01:00 AM
    @Scheduled(cron = "0 0 1 * * *")
    public void markOverdueFeeRecords() {
        log.info("Running scheduled overdue fee record check...");
        int count = feeRecordService.markOverdueRecords();
        log.info("Overdue check complete — {} records updated", count);
    }
}
