package com.feemanagement.service;

import com.feemanagement.dto.FeeDTO;
import com.feemanagement.dto.PagedResponse;

import java.util.List;

public interface IFeeRecordService {
    FeeDTO.RecordResponse createFeeRecord(FeeDTO.RecordRequest request, String createdBy);
    FeeDTO.RecordResponse updateFeeRecord(Long id, FeeDTO.RecordRequest request, String updatedBy);
    FeeDTO.RecordResponse makePayment(Long recordId, FeeDTO.PaymentRequest payment, String recordedBy);
    FeeDTO.RecordResponse getFeeRecordById(Long id);
    PagedResponse<FeeDTO.RecordResponse> getAllFeeRecords(String studentSearch, String status,
            String academicYear, Long categoryId, int page, int size, String sortBy, String sortDir);
    List<FeeDTO.RecordResponse> getFeeRecordsByStudent(Long studentId);
    FeeDTO.DashboardStats getDashboardStats(String academicYear);
    byte[] generateReceipt(Long id);
    byte[] exportFeeRecordsCsv(String academicYear, String status);
    void deleteFeeRecord(Long id);
    int markOverdueRecords();
    List<FeeDTO.RecordResponse> getDueSoonRecords(int daysAhead);
    // Payment gateway mock
    FeeDTO.GatewayOrderResponse createGatewayOrder(FeeDTO.GatewayOrderRequest request);
    FeeDTO.RecordResponse verifyGatewayPayment(FeeDTO.GatewayVerifyRequest request, String recordedBy);
}
