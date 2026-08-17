package com.feemanagement.service;

import com.feemanagement.dto.PagedResponse;
import com.feemanagement.dto.StudentDTO;

import java.util.List;

public interface IStudentService {
    StudentDTO.Response createStudent(StudentDTO.Request request, String createdBy);
    StudentDTO.Response updateStudent(Long id, StudentDTO.Request request, String updatedBy);
    StudentDTO.Response getStudentById(Long id);
    StudentDTO.Response getStudentByStudentId(String studentId);
    PagedResponse<StudentDTO.Response> getAllStudents(String search, String status, String course,
                                                      String academicYear, int page, int size,
                                                      String sortBy, String sortDir);
    List<StudentDTO.Summary> getAllStudentsForDropdown();
    void deleteStudent(Long id);
    List<String> getDistinctCourses();
    List<String> getDistinctAcademicYears();
    byte[] exportStudentsCsv();
}
