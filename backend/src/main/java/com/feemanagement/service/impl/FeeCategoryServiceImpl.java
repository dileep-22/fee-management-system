package com.feemanagement.service.impl;

import com.feemanagement.dto.FeeDTO;
import com.feemanagement.entity.FeeCategory;
import com.feemanagement.exception.BusinessException;
import com.feemanagement.exception.DuplicateResourceException;
import com.feemanagement.exception.ResourceNotFoundException;
import com.feemanagement.mapper.FeeCategoryMapper;
import com.feemanagement.repository.FeeCategoryRepository;
import com.feemanagement.service.IFeeCategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class FeeCategoryServiceImpl implements IFeeCategoryService {

    private final FeeCategoryRepository categoryRepository;
    private final FeeCategoryMapper categoryMapper;

    @Override
    public FeeDTO.CategoryResponse createCategory(FeeDTO.CategoryRequest request, String createdBy) {
        if (request.getAcademicYear() != null &&
                categoryRepository.existsByNameAndAcademicYear(request.getName(), request.getAcademicYear()))
            throw new DuplicateResourceException(
                    "Category '" + request.getName() + "' already exists for " + request.getAcademicYear());

        FeeCategory category = categoryMapper.toEntity(request);
        category.setCreatedBy(createdBy);
        if (request.getIsActive() == null) category.setIsActive(true);

        FeeCategory saved = categoryRepository.save(category);
        log.info("Fee category created: {} by {}", saved.getName(), createdBy);
        return categoryMapper.toResponse(saved);
    }

    @Override
    public FeeDTO.CategoryResponse updateCategory(Long id, FeeDTO.CategoryRequest request) {
        FeeCategory category = findById(id);
        categoryMapper.updateEntityFromRequest(request, category);
        FeeCategory saved = categoryRepository.save(category);
        log.info("Fee category updated: {}", saved.getName());
        return categoryMapper.toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public FeeDTO.CategoryResponse getCategoryById(Long id) {
        return categoryMapper.toResponse(findById(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeDTO.CategoryResponse> getAllCategories(Boolean isActive, String feeType, String academicYear) {
        FeeCategory.FeeType type = null;
        if (feeType != null && !feeType.isBlank()) {
            try { type = FeeCategory.FeeType.valueOf(feeType.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }
        return categoryRepository.findWithFilters(isActive, type, academicYear)
                .stream().map(categoryMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<FeeDTO.CategoryResponse> getActiveCategories() {
        return categoryRepository.findByIsActiveTrue()
                .stream().map(categoryMapper::toResponse).collect(Collectors.toList());
    }

    @Override
    public void deleteCategory(Long id) {
        FeeCategory category = findById(id);
        if (!category.getFeeRecords().isEmpty())
            throw new BusinessException("Cannot delete category with existing fee records");
        categoryRepository.delete(category);
        log.info("Fee category deleted: {}", category.getName());
    }

    @Override
    public void toggleActive(Long id) {
        FeeCategory category = findById(id);
        category.setIsActive(!category.getIsActive());
        categoryRepository.save(category);
        log.info("Fee category '{}' toggled to isActive={}", category.getName(), category.getIsActive());
    }

    private FeeCategory findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fee category not found with id: " + id));
    }
}
