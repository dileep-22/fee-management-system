package com.feemanagement.controller;

import com.feemanagement.dto.ApiResponse;
import com.feemanagement.dto.FeeDTO;
import com.feemanagement.service.IFeeCategoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/fee-categories")
@RequiredArgsConstructor
public class FeeCategoryController {

    private final IFeeCategoryService categoryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<FeeDTO.CategoryResponse>> create(
            @Valid @RequestBody FeeDTO.CategoryRequest request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully",
                        categoryService.createCategory(request, auth.getName())));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<FeeDTO.CategoryResponse>> update(
            @PathVariable Long id, @Valid @RequestBody FeeDTO.CategoryRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully",
                categoryService.updateCategory(id, request)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<FeeDTO.CategoryResponse>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getCategoryById(id)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FeeDTO.CategoryResponse>>> getAll(
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String feeType,
            @RequestParam(required = false) String academicYear) {
        return ResponseEntity.ok(ApiResponse.success(
                categoryService.getAllCategories(isActive, feeType, academicYear)));
    }

    @GetMapping("/active")
    public ResponseEntity<ApiResponse<List<FeeDTO.CategoryResponse>>> getActive() {
        return ResponseEntity.ok(ApiResponse.success(categoryService.getActiveCategories()));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<Void>> toggleActive(@PathVariable Long id) {
        categoryService.toggleActive(id);
        return ResponseEntity.ok(ApiResponse.success("Category status toggled", null));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully", null));
    }
}
