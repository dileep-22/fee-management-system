package com.feemanagement.service;

import com.feemanagement.dto.FeeDTO;
import com.feemanagement.entity.FeeCategory;

import java.util.List;

public interface IFeeCategoryService {
    FeeDTO.CategoryResponse createCategory(FeeDTO.CategoryRequest request, String createdBy);
    FeeDTO.CategoryResponse updateCategory(Long id, FeeDTO.CategoryRequest request);
    FeeDTO.CategoryResponse getCategoryById(Long id);
    List<FeeDTO.CategoryResponse> getAllCategories(Boolean isActive, String feeType, String academicYear);
    List<FeeDTO.CategoryResponse> getActiveCategories();
    void deleteCategory(Long id);
    void toggleActive(Long id);
}
