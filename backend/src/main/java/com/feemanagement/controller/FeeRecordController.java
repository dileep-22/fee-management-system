package com.feemanagement.controller;

import com.feemanagement.dto.ApiResponse;
import com.feemanagement.dto.FeeDTO;
import com.feemanagement.dto.PagedResponse;
import com.feemanagement.service.IFeeRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fee-records")
@RequiredArgsConstructor
public class FeeRecordController {

    private final IFeeRecordService feeRecordService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<FeeDTO.RecordResponse>> create(
            @Valid @RequestBody FeeDTO.RecordRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Fee record created",
                        feeRecordService.createFeeRecord(request, auth.getName())));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<FeeDTO.RecordResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody FeeDTO.RecordRequest request,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Fee record updated",
                feeRecordService.updateFeeRecord(id, request, auth.getName())));
    }

    @PostMapping("/{id}/payment")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<FeeDTO.RecordResponse>> makePayment(
            @PathVariable Long id,
            @Valid @RequestBody FeeDTO.PaymentRequest request,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Payment recorded successfully",
                feeRecordService.makePayment(id, request, auth.getName())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FeeDTO.RecordResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(feeRecordService.getFeeRecordById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<FeeDTO.RecordResponse>>> getAll(
            @RequestParam(required = false) String studentSearch,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success(
                feeRecordService.getAllFeeRecords(studentSearch, status, academicYear,
                        categoryId, page, size, sortBy, sortDir)));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<FeeDTO.RecordResponse>>> getByStudent(
            @PathVariable Long studentId) {
        return ResponseEntity.ok(ApiResponse.success(feeRecordService.getFeeRecordsByStudent(studentId)));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<FeeDTO.DashboardStats>> dashboard(
            @RequestParam(required = false) String academicYear) {
        return ResponseEntity.ok(ApiResponse.success(feeRecordService.getDashboardStats(academicYear)));
    }

    @GetMapping("/due-soon")
    public ResponseEntity<ApiResponse<List<FeeDTO.RecordResponse>>> dueSoon(
            @RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(ApiResponse.success(feeRecordService.getDueSoonRecords(days)));
    }

    @GetMapping("/{id}/receipt")
    public ResponseEntity<byte[]> receipt(@PathVariable Long id) {
        byte[] pdf = feeRecordService.generateReceipt(id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"receipt-" + id + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(pdf);
    }

    @GetMapping("/export/csv")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<byte[]> exportCsv(
            @RequestParam(required = false) String academicYear,
            @RequestParam(required = false) String status) {
        byte[] csv = feeRecordService.exportFeeRecordsCsv(academicYear, status);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"fee-records.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    // ── Payment Gateway ────────────────────────────────────────────────────────

    @PostMapping("/gateway/create-order")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<FeeDTO.GatewayOrderResponse>> createOrder(
            @Valid @RequestBody FeeDTO.GatewayOrderRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Order created",
                feeRecordService.createGatewayOrder(request)));
    }

    @PostMapping("/gateway/verify")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<FeeDTO.RecordResponse>> verifyPayment(
            @Valid @RequestBody FeeDTO.GatewayVerifyRequest request, Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Payment verified and recorded",
                feeRecordService.verifyGatewayPayment(request, auth.getName())));
    }

    @PostMapping("/mark-overdue")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> markOverdue() {
        int count = feeRecordService.markOverdueRecords();
        return ResponseEntity.ok(ApiResponse.success(count + " records marked as overdue", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        feeRecordService.deleteFeeRecord(id);
        return ResponseEntity.ok(ApiResponse.success("Fee record deleted", null));
    }
}
