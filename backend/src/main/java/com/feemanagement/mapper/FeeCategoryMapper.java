package com.feemanagement.mapper;

import com.feemanagement.dto.FeeDTO;
import com.feemanagement.entity.FeeCategory;
import org.mapstruct.*;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FeeCategoryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "feeRecords", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    FeeCategory toEntity(FeeDTO.CategoryRequest request);

    FeeDTO.CategoryResponse toResponse(FeeCategory category);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "feeRecords", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    @Mapping(target = "createdBy", ignore = true)
    void updateEntityFromRequest(FeeDTO.CategoryRequest request, @MappingTarget FeeCategory category);
}
