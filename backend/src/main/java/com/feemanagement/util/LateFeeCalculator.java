package com.feemanagement.util;

import com.feemanagement.entity.FeeCategory;
import com.feemanagement.entity.FeeRecord;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;

@Component
@Slf4j
public class LateFeeCalculator {

    /**
     * Calculates late fee based on category settings.
     * Late fee = totalAmount × (lateFeePercentage / 100) × overdueDays
     * Grace period days are excluded.
     */
    public BigDecimal calculate(FeeRecord record) {
        if (record.getDueDate() == null) return BigDecimal.ZERO;

        FeeCategory category = record.getFeeCategory();
        if (category == null) return BigDecimal.ZERO;

        BigDecimal lateFeePercentage = category.getLateFeePercentage();
        if (lateFeePercentage == null || lateFeePercentage.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }

        LocalDate today = LocalDate.now();
        LocalDate dueDate = record.getDueDate();

        if (!today.isAfter(dueDate)) return BigDecimal.ZERO;

        int gracePeriodDays = category.getGracePeriodDays() != null ? category.getGracePeriodDays() : 0;
        long daysOverdue = ChronoUnit.DAYS.between(dueDate, today) - gracePeriodDays;

        if (daysOverdue <= 0) return BigDecimal.ZERO;

        // Daily rate = total × percentage / 100
        BigDecimal dailyRate = record.getTotalAmount()
                .multiply(lateFeePercentage)
                .divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);

        BigDecimal lateFee = dailyRate.multiply(BigDecimal.valueOf(daysOverdue))
                .setScale(2, RoundingMode.HALF_UP);

        log.debug("Late fee calculated for record {}: {} days overdue, rate={}, lateFee={}",
                record.getId(), daysOverdue, dailyRate, lateFee);

        return lateFee;
    }

    /**
     * Determines whether to mark record as overdue.
     */
    public boolean isOverdue(FeeRecord record) {
        if (record.getDueDate() == null) return false;
        if (record.getPaymentStatus() == FeeRecord.PaymentStatus.PAID ||
            record.getPaymentStatus() == FeeRecord.PaymentStatus.WAIVED) return false;
        return LocalDate.now().isAfter(record.getDueDate());
    }

    /**
     * Determines payment status from amounts and due date.
     */
    public FeeRecord.PaymentStatus determineStatus(BigDecimal total, BigDecimal paid,
                                                    BigDecimal discount, BigDecimal fine,
                                                    BigDecimal lateFee, LocalDate dueDate) {
        BigDecimal netDue = total.add(fine).add(lateFee).subtract(discount);
        int cmp = paid.compareTo(netDue);

        if (cmp >= 0) return FeeRecord.PaymentStatus.PAID;
        if (paid.compareTo(BigDecimal.ZERO) > 0) {
            if (dueDate != null && LocalDate.now().isAfter(dueDate)) return FeeRecord.PaymentStatus.OVERDUE;
            return FeeRecord.PaymentStatus.PARTIAL;
        }
        if (dueDate != null && LocalDate.now().isAfter(dueDate)) return FeeRecord.PaymentStatus.OVERDUE;
        return FeeRecord.PaymentStatus.PENDING;
    }
}
