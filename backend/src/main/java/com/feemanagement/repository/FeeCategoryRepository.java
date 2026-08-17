package com.feemanagement.repository;

import com.feemanagement.entity.FeeCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeeCategoryRepository extends JpaRepository<FeeCategory, Long> {

    List<FeeCategory> findByIsActiveTrue();

    List<FeeCategory> findByAcademicYearAndIsActiveTrue(String academicYear);

    boolean existsByNameAndAcademicYear(String name, String academicYear);

    @Query("""
        SELECT fc FROM FeeCategory fc
        WHERE (:isActive IS NULL OR fc.isActive = :isActive)
          AND (:feeType IS NULL OR fc.feeType = :feeType)
          AND (:academicYear IS NULL OR :academicYear = '' OR fc.academicYear = :academicYear)
        ORDER BY fc.name ASC
        """)
    List<FeeCategory> findWithFilters(
            @Param("isActive") Boolean isActive,
            @Param("feeType") FeeCategory.FeeType feeType,
            @Param("academicYear") String academicYear);
}
