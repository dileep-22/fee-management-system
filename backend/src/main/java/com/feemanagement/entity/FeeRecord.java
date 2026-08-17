package com.feemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fee_records",
    indexes = {
        @Index(name = "idx_fee_records_student", columnList = "student_id"),
        @Index(name = "idx_fee_records_category", columnList = "fee_category_id"),
        @Index(name = "idx_fee_records_status", columnList = "payment_status"),
        @Index(name = "idx_fee_records_due_date", columnList = "due_date"),
        @Index(name = "idx_fee_records_academic_year", columnList = "academic_year"),
        @Index(name = "idx_fee_records_receipt", columnList = "receipt_number")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeeRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fee_category_id", nullable = false)
    private FeeCategory feeCategory;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "total_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal totalAmount;

    @DecimalMin("0.00")
    @Column(name = "paid_amount", nullable = false, precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(name = "discount_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(name = "fine_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal fineAmount = BigDecimal.ZERO;

    @DecimalMin("0.00")
    @Column(name = "late_fee_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal lateFeeAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private PaymentStatus paymentStatus = PaymentStatus.PENDING;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(length = 20)
    private String semester;

    @Column(name = "receipt_number", unique = true, length = 50)
    private String receiptNumber;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "gateway_reference", length = 100)
    private String gatewayReference;

    @Column(columnDefinition = "TEXT")
    private String remarks;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @Column(name = "updated_by", length = 50)
    private String updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "feeRecord", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PaymentHistory> paymentHistory = new ArrayList<>();

    public enum PaymentStatus {
        PENDING, PARTIAL, PAID, OVERDUE, WAIVED
    }

    @Transient
    public BigDecimal getBalanceAmount() {
        return totalAmount.add(fineAmount).add(lateFeeAmount)
                .subtract(discountAmount).subtract(paidAmount);
    }
}
