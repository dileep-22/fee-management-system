package com.feemanagement.mapper;

import com.feemanagement.dto.StudentDTO;
import com.feemanagement.entity.Student;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface StudentMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "feeRecords", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    Student toEntity(StudentDTO.Request request);

    @Mapping(target = "fullName", expression = "java(student.getFullName())")
    @Mapping(target = "totalFeeRecords", ignore = true)
    @Mapping(target = "totalFeesDue", ignore = true)
    @Mapping(target = "totalFeesPaid", ignore = true)
    @Mapping(target = "outstandingBalance", ignore = true)
    StudentDTO.Response toResponse(Student student);

    StudentDTO.Summary toSummary(Student student);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "feeRecords", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "updatedBy", ignore = true)
    void updateEntityFromRequest(StudentDTO.Request request, @MappingTarget Student student);
}
