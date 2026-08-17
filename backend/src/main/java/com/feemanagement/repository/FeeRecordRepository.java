package com.feemanagement.repository;

import com.feemanagement.entity.FeeRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FeeRecordRepository extends JpaRepository<FeeRecord, Long> {

    List<FeeRecord> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    Optional<FeeRecord> findByReceiptNumber(String receiptNumber);

    @Query("""
        SELECT fr FROM FeeRecord fr
            JOIN FETCH fr.student s
            JOIN FETCH fr.feeCategory fc
        WHERE (:studentSearch IS NULL OR :studentSearch = '' OR
               LOWER(s.firstName) LIKE LOWER(CONCAT('%', :studentSearch, '%')) OR
               LOWER(s.lastName)  LIKE LOWER(CONCAT('%', :studentSearch, '%')) OR
               LOWER(s.studentId) LIKE LOWER(CONCAT('%', :studentSearch, '%')))
          AND (:status IS NULL OR fr.paymentStatus = :status)
          AND (:academicYear IS NULL OR :academicYear = '' OR fr.academicYear = :academicYear)
          AND (:categoryId IS NULL OR fc.id = :categoryId)
        """)
    Page<FeeRecord> findWithFilters(
            @Param("studentSearch") String studentSearch,
            @Param("status") FeeRecord.PaymentStatus status,
            @Param("academicYear") String academicYear,
            @Param("categoryId") Long categoryId,
            Pageable pageable);

    // ── Dashboard stats ────────────────────────────────────────────────────────

    @Query("SELECT COALESCE(SUM(fr.totalAmount), 0) FROM FeeRecord fr WHERE fr.academicYear = :year")
    BigDecimal getTotalFeesByYear(@Param("year") String year);

    @Query("SELECT COALESCE(SUM(fr.paidAmount), 0) FROM FeeRecord fr WHERE fr.academicYear = :year")
    BigDecimal getTotalCollectedByYear(@Param("year") String year);

    @Query("""
        SELECT COALESCE(SUM(fr.totalAmount + fr.fineAmount + fr.lateFeeAmount
                            - fr.discountAmount - fr.paidAmount), 0)
        FROM FeeRecord fr
        WHERE fr.paymentStatus IN ('PENDING', 'PARTIAL', 'OVERDUE')
        """)
    BigDecimal getTotalPendingAmount();

    long countByPaymentStatus(FeeRecord.PaymentStatus status);

    @Query("""
        SELECT COUNT(fr) FROM FeeRecord fr
        WHERE fr.paymentStatus = 'OVERDUE'
           OR (fr.dueDate < CURRENT_DATE AND fr.paymentStatus IN ('PENDING', 'PARTIAL'))
        """)
    long countOverdueRecords();

    // ── Monthly analytics ─────────────────────────────────────────────────────

    @Query("""
        SELECT MONTH(fr.paymentDate) AS month, SUM(fr.paidAmount) AS amount
        FROM FeeRecord fr
        WHERE YEAR(fr.paymentDate) = :year AND fr.paymentDate IS NOT NULL
        GROUP BY MONTH(fr.paymentDate)
        ORDER BY MONTH(fr.paymentDate)
        """)
    List<Object[]> getMonthlyCollectionByYear(@Param("year") int year);

    @Query("""
        SELECT fc.name AS category, SUM(fr.paidAmount) AS collected, SUM(fr.totalAmount) AS total
        FROM FeeRecord fr JOIN fr.feeCategory fc
        WHERE fr.academicYear = :year
        GROUP BY fc.name
        ORDER BY collected DESC
        """)
    List<Object[]> getCollectionByCategoryAndYear(@Param("year") String year);

    @Query("""
        SELECT s.course AS course, SUM(fr.paidAmount) AS collected,
               SUM(fr.totalAmount) AS total, COUNT(fr) AS count
        FROM FeeRecord fr JOIN fr.student s
        WHERE (:year IS NULL OR fr.academicYear = :year)
        GROUP BY s.course
        ORDER BY collected DESC
        """)
    List<Object[]> getCollectionByCourse(@Param("year") String year);

    // ── Due tracking ──────────────────────────────────────────────────────────

    @Query("""
        SELECT fr FROM FeeRecord fr JOIN FETCH fr.student s JOIN FETCH fr.feeCategory fc
        WHERE fr.dueDate BETWEEN :from AND :to
          AND fr.paymentStatus IN ('PENDING', 'PARTIAL')
        ORDER BY fr.dueDate ASC
        """)
    List<FeeRecord> findDueInRange(@Param("from") LocalDate from, @Param("to") LocalDate to);

    @Query("""
        SELECT fr FROM FeeRecord fr JOIN FETCH fr.student s JOIN FETCH fr.feeCategory fc
        WHERE fr.dueDate < :today AND fr.paymentStatus IN ('PENDING', 'PARTIAL')
        ORDER BY fr.dueDate ASC
        """)
    List<FeeRecord> findOverdueFeeRecords(@Param("today") LocalDate today);

    // ── Report export ─────────────────────────────────────────────────────────

    @Query("""
        SELECT fr FROM FeeRecord fr JOIN FETCH fr.student s JOIN FETCH fr.feeCategory fc
        WHERE (:academicYear IS NULL OR fr.academicYear = :academicYear)
          AND (:status IS NULL OR fr.paymentStatus = :status)
        ORDER BY s.studentId ASC, fr.createdAt DESC
        """)
    List<FeeRecord> findAllForExport(
            @Param("academicYear") String academicYear,
            @Param("status") FeeRecord.PaymentStatus status);

    // ── Bulk overdue update ───────────────────────────────────────────────────

    @Modifying
    @Query("""
        UPDATE FeeRecord fr SET fr.paymentStatus = 'OVERDUE'
        WHERE fr.dueDate < :today
          AND fr.paymentStatus IN ('PENDING', 'PARTIAL')
        """)
    int markOverdueRecords(@Param("today") LocalDate today);
}
