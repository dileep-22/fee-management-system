package com.feemanagement.controller;

import com.feemanagement.dto.ApiResponse;
import com.feemanagement.dto.PagedResponse;
import com.feemanagement.dto.StudentDTO;
import com.feemanagement.service.IStudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/students")
@RequiredArgsConstructor
public class StudentController {

    private final IStudentService studentService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<StudentDTO.Response>> create(
            @Valid @RequestBody StudentDTO.Request request, Authentication auth) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Student created successfully",
                        studentService.createStudent(request, auth.getName())));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<ApiResponse<StudentDTO.Response>> update(
            @PathVariable Long id,
            @Valid @RequestBody StudentDTO.Request request,
            Authentication auth) {
        return ResponseEntity.ok(ApiResponse.success("Student updated successfully",
                studentService.updateStudent(id, request, auth.getName())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StudentDTO.Response>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudentById(id)));
    }

    @GetMapping("/code/{studentId}")
    public ResponseEntity<ApiResponse<StudentDTO.Response>> getByStudentId(@PathVariable String studentId) {
        return ResponseEntity.ok(ApiResponse.success(studentService.getStudentByStudentId(studentId)));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<StudentDTO.Response>>> getAll(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String course,
            @RequestParam(required = false) String academicYear,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        return ResponseEntity.ok(ApiResponse.success(
                studentService.getAllStudents(search, status, course, academicYear, page, size, sortBy, sortDir)));
    }

    @GetMapping("/dropdown")
    public ResponseEntity<ApiResponse<List<StudentDTO.Summary>>> dropdown() {
        return ResponseEntity.ok(ApiResponse.success(studentService.getAllStudentsForDropdown()));
    }

    @GetMapping("/courses")
    public ResponseEntity<ApiResponse<List<String>>> courses() {
        return ResponseEntity.ok(ApiResponse.success(studentService.getDistinctCourses()));
    }

    @GetMapping("/academic-years")
    public ResponseEntity<ApiResponse<List<String>>> academicYears() {
        return ResponseEntity.ok(ApiResponse.success(studentService.getDistinctAcademicYears()));
    }

    @GetMapping("/export/csv")
    @PreAuthorize("hasAnyRole('ADMIN','STAFF')")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] csv = studentService.exportStudentsCsv();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"students.csv\"")
                .contentType(MediaType.parseMediaType("text/csv"))
                .body(csv);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(ApiResponse.success("Student deleted successfully", null));
    }
}
