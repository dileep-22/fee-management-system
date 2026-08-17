package com.feemanagement.service.impl;

import com.feemanagement.dto.PagedResponse;
import com.feemanagement.dto.StudentDTO;
import com.feemanagement.entity.Student;
import com.feemanagement.exception.DuplicateResourceException;
import com.feemanagement.exception.ResourceNotFoundException;
import com.feemanagement.mapper.StudentMapper;
import com.feemanagement.repository.FeeRecordRepository;
import com.feemanagement.repository.StudentRepository;
import com.feemanagement.service.IStudentService;
import com.feemanagement.util.CsvExporter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class StudentServiceImpl implements IStudentService {

    private final StudentRepository studentRepository;
    private final FeeRecordRepository feeRecordRepository;
    private final StudentMapper studentMapper;
    private final CsvExporter csvExporter;

    @Override
    public StudentDTO.Response createStudent(StudentDTO.Request request, String createdBy) {
        if (studentRepository.existsByStudentId(request.getStudentId()))
            throw new DuplicateResourceException("Student ID already exists: " + request.getStudentId());
        if (studentRepository.existsByEmail(request.getEmail()))
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());

        Student student = studentMapper.toEntity(request);
        student.setCreatedBy(createdBy);
        student.setUpdatedBy(createdBy);
        if (request.getStatus() == null) student.setStatus(Student.StudentStatus.ACTIVE);

        Student saved = studentRepository.save(student);
        log.info("Student created: {} by {}", saved.getStudentId(), createdBy);
        return enrichResponse(studentMapper.toResponse(saved), saved.getId());
    }

    @Override
    public StudentDTO.Response updateStudent(Long id, StudentDTO.Request request, String updatedBy) {
        Student student = findById(id);

        if (!student.getStudentId().equals(request.getStudentId())
                && studentRepository.existsByStudentId(request.getStudentId()))
            throw new DuplicateResourceException("Student ID already exists: " + request.getStudentId());

        if (!student.getEmail().equals(request.getEmail())
                && studentRepository.existsByEmail(request.getEmail()))
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());

        studentMapper.updateEntityFromRequest(request, student);
        student.setUpdatedBy(updatedBy);

        Student saved = studentRepository.save(student);
        log.info("Student updated: {} by {}", saved.getStudentId(), updatedBy);
        return enrichResponse(studentMapper.toResponse(saved), saved.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDTO.Response getStudentById(Long id) {
        Student student = findById(id);
        return enrichResponse(studentMapper.toResponse(student), id);
    }

    @Override
    @Transactional(readOnly = true)
    public StudentDTO.Response getStudentByStudentId(String studentId) {
        Student student = studentRepository.findByStudentId(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with ID: " + studentId));
        return enrichResponse(studentMapper.toResponse(student), student.getId());
    }

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<StudentDTO.Response> getAllStudents(String search, String status,
            String course, String academicYear, int page, int size, String sortBy, String sortDir) {

        Sort sort = sortDir.equalsIgnoreCase("desc")
                ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Student.StudentStatus statusEnum = null;
        if (status != null && !status.isBlank()) {
            try { statusEnum = Student.StudentStatus.valueOf(status.toUpperCase()); }
            catch (IllegalArgumentException ignored) {}
        }

        Page<Student> studentsPage = studentRepository.findWithFilters(
                blankToNull(search), statusEnum, blankToNull(course), blankToNull(academicYear), pageable);

        Page<StudentDTO.Response> responsePage = studentsPage.map(s ->
                enrichResponse(studentMapper.toResponse(s), s.getId()));
        return PagedResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StudentDTO.Summary> getAllStudentsForDropdown() {
        return studentRepository.findAll(Sort.by("firstName").ascending())
                .stream().map(studentMapper::toSummary).collect(Collectors.toList());
    }

    @Override
    public void deleteStudent(Long id) {
        Student student = findById(id);
        studentRepository.delete(student);
        log.info("Student deleted: {}", student.getStudentId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistinctCourses() {
        return studentRepository.findDistinctCourses();
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getDistinctAcademicYears() {
        return studentRepository.findDistinctAcademicYears();
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportStudentsCsv() {
        List<Student> students = studentRepository.findAll(Sort.by("studentId").ascending());
        return csvExporter.exportStudents(students);
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    private Student findById(Long id) {
        return studentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + id));
    }

    private StudentDTO.Response enrichResponse(StudentDTO.Response resp, Long studentId) {
        try {
            var records = feeRecordRepository.findByStudentIdOrderByCreatedAtDesc(studentId);
            BigDecimal totalDue  = records.stream().map(r -> r.getTotalAmount())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            BigDecimal totalPaid = records.stream().map(r -> r.getPaidAmount())
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            resp.setTotalFeeRecords((long) records.size());
            resp.setTotalFeesDue(totalDue);
            resp.setTotalFeesPaid(totalPaid);
            resp.setOutstandingBalance(totalDue.subtract(totalPaid));
        } catch (Exception e) {
            log.warn("Could not enrich student response with fee summary: {}", e.getMessage());
        }
        return resp;
    }

    private String blankToNull(String s) { return (s == null || s.isBlank()) ? null : s; }
}
