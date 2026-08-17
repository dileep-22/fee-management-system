package com.feemanagement.repository;

import com.feemanagement.entity.PaymentHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentHistoryRepository extends JpaRepository<PaymentHistory, Long> {

    List<PaymentHistory> findByFeeRecordIdOrderByCreatedAtDesc(Long feeRecordId);

    @Query("""
        SELECT ph FROM PaymentHistory ph
        JOIN ph.feeRecord fr JOIN fr.student s
        WHERE s.id = :studentId
        ORDER BY ph.paymentDate DESC
        """)
    List<PaymentHistory> findByStudentId(@Param("studentId") Long studentId);

    @Query("""
        SELECT COALESCE(SUM(ph.amountPaid), 0)
        FROM PaymentHistory ph
        WHERE ph.paymentDate BETWEEN :from AND :to
        """)
    BigDecimal sumPaymentsBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
}
