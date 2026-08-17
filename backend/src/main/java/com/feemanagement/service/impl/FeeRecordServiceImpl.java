package com.feemanagement.service.impl;

import com.feemanagement.dto.FeeDTO;
import com.feemanagement.dto.PagedResponse;
import com.feemanagement.entity.*;
import com.feemanagement.exception.BusinessException;
import com.feemanagement.exception.ResourceNotFoundException;
import com.feemanagement.mapper.FeeRecordMapper;
import com.feemanagement.repository.*;
import com.feemanagement.service.IFeeRecordService;
import com.feemanagement.service.RazorpayService;
import com.feemanagement.util.CsvExporter;
import com.feemanagement.util.LateFeeCalculator;
import com.feemanagement.util.ReceiptGenerator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Month;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FeeRecordServiceImpl implements IFeeRecordService {

    private final FeeRecordRepository       feeRecordRepository;
    private final StudentRepository         studentRepository;
    private final FeeCategoryRepository     categoryRepository;
    private final PaymentHistoryRepository  paymentHistoryRepository;
    private final FeeRecordMapper           feeRecordMapper;
    private final LateFeeCalculator         lateFeeCalculator;
    private final ReceiptGenerator          receiptGenerator;
    private final CsvExporter              csvExporter;
    private final RazorpayService           razorpayService;      // ← real Razorpay

    // ── Create ─────────────────────────────────────────────────────────────────

    @Override
    public FeeDTO.RecordResponse createFeeRecord(FeeDTO.RecordRequest request, String createdBy) {
        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found: " + request.getStudentId()));
        FeeCategory category = categoryRepository.findById(request.getFeeCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Fee category not found: " + request.getFeeCategoryId()));

        BigDecimal paid     = nvd(request.getPaidAmount());
        BigDecimal discount = nvd(request.getDiscountAmount());
        BigDecimal fine     = nvd(request.getFineAmount());
        BigDecimal total    = request.getTotalAmount();

        FeeRecord record = FeeRecord.builder()
                .student(student).feeCategory(category)
                .totalAmount(total).paidAmount(paid)
                .discountAmount(discount).fineAmount(fine)
                .lateFeeAmount(BigDecimal.ZERO)
                .dueDate(request.getDueDate())
                .paymentDate(paid.compareTo(BigDecimal.ZERO) > 0
                        ? (request.getPaymentDate() != null ? request.getPaymentDate() : LocalDate.now()) : null)
                .academicYear(request.getAcademicYear()).semester(request.getSemester())
                .receiptNumber(generateReceiptNumber())
                .paymentMethod(request.getPaymentMethod())
                .transactionId(request.getTransactionId())
                .gatewayReference(request.getGatewayReference())
                .remarks(request.getRemarks())
                .createdBy(createdBy).updatedBy(createdBy)
                .build();

        record.setPaymentStatus(lateFeeCalculator.determineStatus(
                total, paid, discount, fine, BigDecimal.ZERO, request.getDueDate()));

        FeeRecord saved = feeRecordRepository.save(record);

        if (paid.compareTo(BigDecimal.ZERO) > 0) {
            savePaymentHistory(saved, paid, request.getPaymentMethod(),
                    request.getTransactionId(), request.getGatewayReference(),
                    null, saved.getBalanceAmount(), createdBy, request.getRemarks());
        }

        log.info("Fee record created: {} for student {} by {}",
                saved.getReceiptNumber(), student.getStudentId(), createdBy);
        return toResponseWithHistory(saved);
    }

    // ── Update ─────────────────────────────────────────────────────────────────

    @Override
    public FeeDTO.RecordResponse updateFeeRecord(Long id, FeeDTO.RecordRequest request, String updatedBy) {
        FeeRecord record = findById(id);
        if (record.getPaymentStatus() == FeeRecord.PaymentStatus.PAID)
            throw new BusinessException("Cannot edit a fully paid fee record");

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
        FeeCategory category = categoryRepository.findById(request.getFeeCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Fee category not found"));

        record.setStudent(student); record.setFeeCategory(category);
        record.setTotalAmount(request.getTotalAmount());
        record.setDiscountAmount(nvd(request.getDiscountAmount()));
        record.setFineAmount(nvd(request.getFineAmount()));
        record.setDueDate(request.getDueDate());
        record.setAcademicYear(request.getAcademicYear());
        record.setSemester(request.getSemester());
        record.setRemarks(request.getRemarks());
        record.setUpdatedBy(updatedBy);

        record.setLateFeeAmount(lateFeeCalculator.calculate(record));
        record.setPaymentStatus(lateFeeCalculator.determineStatus(
                record.getTotalAmount(), record.getPaidAmount(),
                record.getDiscountAmount(), record.getFineAmount(),
                record.getLateFeeAmount(), record.getDueDate()));

        return toResponseWithHistory(feeRecordRepository.save(record));
    }

    // ── Manual payment ─────────────────────────────────────────────────────────

    @Override
    public FeeDTO.RecordResponse makePayment(Long recordId, FeeDTO.PaymentRequest payment,
                                             String recordedBy) {
        FeeRecord record = findById(recordId);
        if (record.getPaymentStatus() == FeeRecord.PaymentStatus.PAID)
            throw new BusinessException("Fee record is already fully paid");
        if (record.getPaymentStatus() == FeeRecord.PaymentStatus.WAIVED)
            throw new BusinessException("Fee record is waived");

        BigDecimal lateFee = lateFeeCalculator.calculate(record);
        record.setLateFeeAmount(lateFee);

        BigDecimal netDue   = record.getTotalAmount().add(record.getFineAmount())
                .add(lateFee).subtract(record.getDiscountAmount());
        BigDecimal remaining = netDue.subtract(record.getPaidAmount());

        if (payment.getAmount().compareTo(remaining) > 0)
            throw new BusinessException(String.format(
                    "Payment amount (%.2f) exceeds balance due (%.2f)",
                    payment.getAmount(), remaining));

        BigDecimal newPaid = record.getPaidAmount().add(payment.getAmount());
        record.setPaidAmount(newPaid);
        record.setPaymentMethod(payment.getPaymentMethod());
        record.setPaymentDate(payment.getPaymentDate() != null ? payment.getPaymentDate() : LocalDate.now());
        if (payment.getTransactionId() != null)  record.setTransactionId(payment.getTransactionId());
        if (payment.getGatewayReference() != null) record.setGatewayReference(payment.getGatewayReference());
        if (payment.getRemarks() != null)         record.setRemarks(payment.getRemarks());
        record.setUpdatedBy(recordedBy);

        record.setPaymentStatus(lateFeeCalculator.determineStatus(
                record.getTotalAmount(), newPaid,
                record.getDiscountAmount(), record.getFineAmount(),
                lateFee, record.getDueDate()));

        FeeRecord saved = feeRecordRepository.save(record);
        savePaymentHistory(saved, payment.getAmount(), payment.getPaymentMethod(),
                payment.getTransactionId(), payment.getGatewayReference(),
                payment.getPaymentGateway(), saved.getBalanceAmount(), recordedBy, payment.getRemarks());

        log.info("Payment of {} recorded for fee record {} by {}",
                payment.getAmount(), recordId, recordedBy);
        return toResponseWithHistory(saved);
    }

    // ── Reads ──────────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public FeeDTO.RecordResponse getFeeRecordById(Long id) {
        return toResponseWithHistory(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<FeeDTO.RecordResponse> getAllFeeRecords(String studentSearch, String status,
            String academicYear, Long categoryId, int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        FeeRecord.PaymentStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try { statusEnum = FeeRecord.PaymentStatus.valueOf(status.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }

        Page<FeeRecord> recordsPage = feeRecordRepository.findWithFilters(
                blankToNull(studentSearch), statusEnum, blankToNull(academicYear), categoryId, pageable);

        return PagedResponse.from(recordsPage.map(this::toResponseWithHistory));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeDTO.RecordResponse> getFeeRecordsByStudent(Long studentId) {
        if (!studentRepository.existsById(studentId))
            throw new ResourceNotFoundException("Student not found: " + studentId);
        return feeRecordRepository.findByStudentIdOrderByCreatedAtDesc(studentId)
                .stream().map(this::toResponseWithHistory).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public FeeDTO.DashboardStats getDashboardStats(String academicYear) {
        String year = (academicYear != null && !academicYear.isBlank()) ? academicYear : null;
        int currentYear = LocalDate.now().getYear();

        BigDecimal totalFees     = year != null ? feeRecordRepository.getTotalFeesByYear(year)      : BigDecimal.ZERO;
        BigDecimal collectedFees = year != null ? feeRecordRepository.getTotalCollectedByYear(year)  : BigDecimal.ZERO;
        BigDecimal pendingFees   = feeRecordRepository.getTotalPendingAmount();

        long totalStudents  = studentRepository.count();
        long activeStudents = studentRepository.countByStatus(Student.StudentStatus.ACTIVE);
        long paidCount      = feeRecordRepository.countByPaymentStatus(FeeRecord.PaymentStatus.PAID);
        long pendingCount   = feeRecordRepository.countByPaymentStatus(FeeRecord.PaymentStatus.PENDING);
        long partialCount   = feeRecordRepository.countByPaymentStatus(FeeRecord.PaymentStatus.PARTIAL);
        long overdueCount   = feeRecordRepository.countOverdueRecords();

        double collectionRate = totalFees.compareTo(BigDecimal.ZERO) > 0
                ? collectedFees.divide(totalFees, 4, java.math.RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                : 0.0;

        List<FeeDTO.MonthlyCollection> monthly = new ArrayList<>();
        Map<Integer, BigDecimal> monthMap = new LinkedHashMap<>();
        for (Object[] row : feeRecordRepository.getMonthlyCollectionByYear(currentYear))
            monthMap.put(((Number) row[0]).intValue(), (BigDecimal) row[1]);
        for (int m = 1; m <= 12; m++)
            monthly.add(FeeDTO.MonthlyCollection.builder()
                    .month(m)
                    .monthName(Month.of(m).getDisplayName(TextStyle.SHORT, Locale.ENGLISH))
                    .amount(monthMap.getOrDefault(m, BigDecimal.ZERO))
                    .build());

        List<FeeDTO.CategoryStat> categoryStats = new ArrayList<>();
        if (year != null)
            for (Object[] row : feeRecordRepository.getCollectionByCategoryAndYear(year))
                categoryStats.add(FeeDTO.CategoryStat.builder()
                        .category((String) row[0])
                        .collected((BigDecimal) row[1])
                        .total((BigDecimal) row[2])
                        .build());

        return FeeDTO.DashboardStats.builder()
                .totalStudents(totalStudents).activeStudents(activeStudents)
                .totalFees(totalFees).collectedFees(collectedFees).pendingFees(pendingFees)
                .paidCount(paidCount).pendingCount(pendingCount)
                .partialCount(partialCount).overdueCount(overdueCount)
                .collectionRate(collectionRate)
                .monthlyCollections(monthly).categoryStats(categoryStats)
                .build();
    }

    @Override
    public byte[] generateReceipt(Long id) {
        return receiptGenerator.generateReceipt(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportFeeRecordsCsv(String academicYear, String status) {
        FeeRecord.PaymentStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try { statusEnum = FeeRecord.PaymentStatus.valueOf(status.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }
        return csvExporter.exportFeeRecords(
                feeRecordRepository.findAllForExport(blankToNull(academicYear), statusEnum));
    }

    @Override
    public void deleteFeeRecord(Long id) {
        FeeRecord record = findById(id);
        if (record.getPaymentStatus() == FeeRecord.PaymentStatus.PAID)
            throw new BusinessException("Cannot delete a paid fee record");
        feeRecordRepository.delete(record);
        log.info("Fee record {} deleted", id);
    }

    @Override
    public int markOverdueRecords() {
        int count = feeRecordRepository.markOverdueRecords(LocalDate.now());
        if (count > 0) log.info("Marked {} fee records as OVERDUE", count);
        return count;
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeDTO.RecordResponse> getDueSoonRecords(int daysAhead) {
        LocalDate from = LocalDate.now();
        LocalDate to   = from.plusDays(daysAhead);
        return feeRecordRepository.findDueInRange(from, to)
                .stream().map(this::toResponseWithHistory).collect(Collectors.toList());
    }

    // ── ✅ Real Razorpay gateway ────────────────────────────────────────────────

    @Override
    public FeeDTO.GatewayOrderResponse createGatewayOrder(FeeDTO.GatewayOrderRequest request) {
        FeeRecord record = findById(request.getFeeRecordId());
        if (record.getPaymentStatus() == FeeRecord.PaymentStatus.PAID)
            throw new BusinessException("Fee record is already fully paid");
        if (record.getPaymentStatus() == FeeRecord.PaymentStatus.WAIVED)
            throw new BusinessException("Fee record is waived");

        BigDecimal amount = request.getAmount() != null
                ? request.getAmount()
                : record.getBalanceAmount();

        if (amount.compareTo(BigDecimal.ZERO) <= 0)
            throw new BusinessException("Nothing to pay — balance is zero");

        // Delegate to RazorpayService which calls the real Razorpay API
        return razorpayService.createOrder(
                request.getFeeRecordId(),
                amount,
                request.getCurrency() != null ? request.getCurrency() : "INR",
                "Fee payment – " + record.getFeeCategory().getName()
                        + " for " + record.getStudent().getFullName()
        );
    }

    @Override
    public FeeDTO.RecordResponse verifyGatewayPayment(FeeDTO.GatewayVerifyRequest request,
                                                       String recordedBy) {
        // ✅ Real HMAC-SHA256 signature verification via Razorpay
        razorpayService.verifySignature(
                request.getOrderId(),
                request.getPaymentId(),
                request.getSignature()
        );

        // Signature verified — record the payment
        FeeDTO.PaymentRequest paymentReq = FeeDTO.PaymentRequest.builder()
                .amount(request.getAmount())
                .paymentMethod("RAZORPAY")
                .transactionId(request.getPaymentId())
                .gatewayReference(request.getOrderId())
                .paymentGateway(PaymentHistory.PaymentGateway.RAZORPAY)
                .paymentDate(LocalDate.now())
                .remarks("Razorpay payment verified | Order: " + request.getOrderId()
                        + " | Payment: " + request.getPaymentId())
                .build();

        log.info("Razorpay payment verified and recording: order={} payment={}",
                request.getOrderId(), request.getPaymentId());

        return makePayment(request.getFeeRecordId(), paymentReq, recordedBy);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private FeeRecord findById(Long id) {
        return feeRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee record not found: " + id));
    }

    private FeeDTO.RecordResponse toResponseWithHistory(FeeRecord record) {
        FeeDTO.RecordResponse resp = feeRecordMapper.toResponse(record);
        List<PaymentHistory> history =
                paymentHistoryRepository.findByFeeRecordIdOrderByCreatedAtDesc(record.getId());
        resp.setPaymentHistory(history.stream()
                .map(feeRecordMapper::toPaymentHistoryDTO).collect(Collectors.toList()));
        return resp;
    }

    private void savePaymentHistory(FeeRecord record, BigDecimal amount, String method,
                                    String txId, String gwRef,
                                    PaymentHistory.PaymentGateway gateway,
                                    BigDecimal balanceAfter, String recordedBy, String remarks) {
        paymentHistoryRepository.save(PaymentHistory.builder()
                .feeRecord(record)
                .amountPaid(amount)
                .paymentMethod(method)
                .transactionId(txId)
                .gatewayReference(gwRef)
                .paymentGateway(gateway)
                .paymentDate(record.getPaymentDate() != null ? record.getPaymentDate() : LocalDate.now())
                .balanceAfter(balanceAfter)
                .recordedBy(recordedBy)
                .remarks(remarks)
                .build());
    }

    private String generateReceiptNumber() {
        return "RCPT-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
    }

    private BigDecimal nvd(BigDecimal v) { return v != null ? v : BigDecimal.ZERO; }
    private String blankToNull(String s) { return (s == null || s.isBlank()) ? null : s; }
}
