package com.feemanagement.repository;

import com.feemanagement.entity.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByStudentId(String studentId);
    boolean existsByStudentId(String studentId);
    boolean existsByEmail(String email);

    @Query("""
        SELECT s FROM Student s
        WHERE (:search IS NULL OR :search = '' OR
               LOWER(s.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(s.lastName)  LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(s.email)     LIKE LOWER(CONCAT('%', :search, '%')) OR
               LOWER(s.studentId) LIKE LOWER(CONCAT('%', :search, '%')))
          AND (:status IS NULL OR s.status = :status)
          AND (:course IS NULL OR :course = '' OR LOWER(s.course) LIKE LOWER(CONCAT('%', :course, '%')))
          AND (:academicYear IS NULL OR :academicYear = '' OR s.academicYear = :academicYear)
        """)
    Page<Student> findWithFilters(
            @Param("search") String search,
            @Param("status") Student.StudentStatus status,
            @Param("course") String course,
            @Param("academicYear") String academicYear,
            Pageable pageable);

    List<Student> findAll(Sort sort);

    @Query("SELECT DISTINCT s.course FROM Student s WHERE s.course IS NOT NULL ORDER BY s.course")
    List<String> findDistinctCourses();

    @Query("SELECT DISTINCT s.academicYear FROM Student s WHERE s.academicYear IS NOT NULL ORDER BY s.academicYear DESC")
    List<String> findDistinctAcademicYears();

    long countByStatus(Student.StudentStatus status);
}
