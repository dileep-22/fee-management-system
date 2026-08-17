package com.feemanagement.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "payment_history",
    indexes = {
        @Index(name = "idx_payment_history_record", columnList = "fee_record_id"),
        @Index(name = "idx_payment_history_date", columnList = "payment_date")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fee_record_id", nullable = false)
    private FeeRecord feeRecord;

    @Column(name = "amount_paid", nullable = false, precision = 10, scale = 2)
    private BigDecimal amountPaid;

    @Column(name = "payment_method", length = 50)
    private String paymentMethod;

    @Column(name = "transaction_id", length = 100)
    private String transactionId;

    @Column(name = "gateway_reference", length = 100)
    private String gatewayReference;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "balance_after", precision = 10, scale = 2)
    private BigDecimal balanceAfter;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_gateway")
    private PaymentGateway paymentGateway;

    @Column(length = 500)
    private String remarks;

    @Column(name = "recorded_by", length = 50)
    private String recordedBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public enum PaymentGateway {
        CASH, RAZORPAY, STRIPE, BANK_TRANSFER, CHEQUE, ONLINE
    }
}
