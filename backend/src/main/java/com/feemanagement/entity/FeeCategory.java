package com.feemanagement.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "fee_categories",
    indexes = {
        @Index(name = "idx_fee_categories_active", columnList = "is_active"),
        @Index(name = "idx_fee_categories_type", columnList = "fee_type")
    }
)
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class FeeCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @NotNull
    @DecimalMin("0.00")
    @Column(name = "default_amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal defaultAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private FeeType feeType = FeeType.ONE_TIME;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "late_fee_percentage", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal lateFeePercentage = BigDecimal.ZERO;

    @Column(name = "grace_period_days")
    @Builder.Default
    private Integer gracePeriodDays = 0;

    @Column(name = "academic_year", length = 20)
    private String academicYear;

    @Column(name = "created_by", length = 50)
    private String createdBy;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "feeCategory", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @Builder.Default
    private List<FeeRecord> feeRecords = new ArrayList<>();

    public enum FeeType {
        ONE_TIME, MONTHLY, SEMESTER, ANNUAL
    }
}
