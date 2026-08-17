package com.feemanagement.mapper;

import com.feemanagement.dto.FeeDTO;
import com.feemanagement.entity.FeeRecord;
import com.feemanagement.entity.PaymentHistory;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FeeRecordMapper {

    @Mapping(target = "studentId", source = "student.id")
    @Mapping(target = "studentName", expression = "java(record.getStudent().getFullName())")
    @Mapping(target = "studentCode", source = "student.studentId")
    @Mapping(target = "feeCategoryId", source = "feeCategory.id")
    @Mapping(target = "feeCategoryName", source = "feeCategory.name")
    @Mapping(target = "balanceAmount", expression = "java(record.getBalanceAmount())")
    @Mapping(target = "paymentHistory", ignore = true)
    FeeDTO.RecordResponse toResponse(FeeRecord record);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "amountPaid", source = "amountPaid")
    FeeDTO.PaymentHistoryDTO toPaymentHistoryDTO(PaymentHistory history);
}
