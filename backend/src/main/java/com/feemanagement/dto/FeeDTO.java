package com.feemanagement.dto;

import com.feemanagement.entity.FeeCategory;
import com.feemanagement.entity.FeeRecord;
import com.feemanagement.entity.PaymentHistory;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class FeeDTO {

    // ── Fee Category ───────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CategoryRequest {
        @NotBlank(message = "Category name is required")
        @Size(max = 100)
        private String name;

        private String description;

        @NotNull(message = "Default amount is required")
        @DecimalMin(value = "0.00", message = "Amount must be non-negative")
        private BigDecimal defaultAmount;

        @NotNull(message = "Fee type is required")
        private FeeCategory.FeeType feeType;

        private Boolean isActive;

        @DecimalMin(value = "0.00") @DecimalMax(value = "100.00")
        private BigDecimal lateFeePercentage;

        @Min(0)
        private Integer gracePeriodDays;

        private String academicYear;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CategoryResponse {
        private Long id;
        private String name;
        private String description;
        private BigDecimal defaultAmount;
        private FeeCategory.FeeType feeType;
        private Boolean isActive;
        private BigDecimal lateFeePercentage;
        private Integer gracePeriodDays;
        private String academicYear;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    // ── Fee Record ─────────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RecordRequest {
        @NotNull(message = "Student ID is required")
        private Long studentId;

        @NotNull(message = "Fee category ID is required")
        private Long feeCategoryId;

        @NotNull(message = "Total amount is required")
        @DecimalMin(value = "0.00")
        private BigDecimal totalAmount;

        @DecimalMin(value = "0.00")
        private BigDecimal paidAmount;

        @DecimalMin(value = "0.00")
        private BigDecimal discountAmount;

        @DecimalMin(value = "0.00")
        private BigDecimal fineAmount;

        private LocalDate dueDate;
        private LocalDate paymentDate;
        private String academicYear;
        private String semester;
        private String paymentMethod;
        private String transactionId;
        private String gatewayReference;
        private String remarks;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class RecordResponse {
        private Long id;
        private Long studentId;
        private String studentName;
        private String studentCode;
        private Long feeCategoryId;
        private String feeCategoryName;
        private BigDecimal totalAmount;
        private BigDecimal paidAmount;
        private BigDecimal discountAmount;
        private BigDecimal fineAmount;
        private BigDecimal lateFeeAmount;
        private BigDecimal balanceAmount;
        private FeeRecord.PaymentStatus paymentStatus;
        private LocalDate dueDate;
        private LocalDate paymentDate;
        private String academicYear;
        private String semester;
        private String receiptNumber;
        private String paymentMethod;
        private String transactionId;
        private String gatewayReference;
        private String remarks;
        private String createdBy;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private List<PaymentHistoryDTO> paymentHistory;
    }

    // ── Payment ────────────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PaymentRequest {
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.01", message = "Payment amount must be positive")
        private BigDecimal amount;

        @NotBlank(message = "Payment method is required")
        private String paymentMethod;

        private String transactionId;
        private String gatewayReference;
        private PaymentHistory.PaymentGateway paymentGateway;
        private LocalDate paymentDate;
        private String remarks;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class PaymentHistoryDTO {
        private Long id;
        private BigDecimal amountPaid;
        private String paymentMethod;
        private String transactionId;
        private String gatewayReference;
        private LocalDate paymentDate;
        private BigDecimal balanceAfter;
        private PaymentHistory.PaymentGateway paymentGateway;
        private String remarks;
        private String recordedBy;
        private LocalDateTime createdAt;
    }

    // ── Mock Payment Gateway ───────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class GatewayOrderRequest {
        @NotNull private Long feeRecordId;
        @NotNull private BigDecimal amount;
        @NotNull private String currency;
        private PaymentHistory.PaymentGateway gateway;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class GatewayOrderResponse {
        private String orderId;
        private String keyId;
        private BigDecimal amount;
        private String currency;
        private String status;
        private String gatewayName;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class GatewayVerifyRequest {
        @NotNull private Long feeRecordId;
        @NotBlank private String orderId;
        @NotBlank private String paymentId;
        @NotBlank private String signature;
        @NotNull private BigDecimal amount;
        private PaymentHistory.PaymentGateway gateway;
    }

    // ── Dashboard ──────────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class DashboardStats {
        private long totalStudents;
        private long activeStudents;
        private BigDecimal totalFees;
        private BigDecimal collectedFees;
        private BigDecimal pendingFees;
        private long pendingCount;
        private long paidCount;
        private long overdueCount;
        private long partialCount;
        private double collectionRate;
        private List<MonthlyCollection> monthlyCollections;
        private List<CategoryStat> categoryStats;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class MonthlyCollection {
        private int month;
        private String monthName;
        private BigDecimal amount;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class CategoryStat {
        private String category;
        private BigDecimal collected;
        private BigDecimal total;
    }

    // ── Reports ────────────────────────────────────────────────────────────────

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class ReportFilter {
        private String academicYear;
        private String status;
        private String course;
        private LocalDate fromDate;
        private LocalDate toDate;
    }
}
