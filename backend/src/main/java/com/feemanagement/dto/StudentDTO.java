package com.feemanagement.dto;

import com.feemanagement.entity.Student;
import jakarta.validation.constraints.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class StudentDTO {

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Request {
        @NotBlank(message = "Student ID is required")
        @Size(max = 20, message = "Student ID must not exceed 20 characters")
        private String studentId;

        @NotBlank(message = "First name is required")
        @Size(max = 50)
        private String firstName;

        @NotBlank(message = "Last name is required")
        @Size(max = 50)
        private String lastName;

        @Email(message = "Invalid email format")
        @NotBlank(message = "Email is required")
        private String email;

        @Pattern(regexp = "^[+]?[0-9]{7,15}$", message = "Invalid phone number")
        private String phone;

        @Past(message = "Date of birth must be in the past")
        private LocalDate dateOfBirth;

        @NotBlank(message = "Course is required")
        @Size(max = 100)
        private String course;

        @Size(max = 20)
        private String semester;

        @Size(max = 20)
        private String academicYear;

        private Student.StudentStatus status;
        private String address;

        @Size(max = 100)
        private String guardianName;

        @Pattern(regexp = "^[+]?[0-9]{7,15}$", message = "Invalid guardian phone number")
        private String guardianPhone;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Response {
        private Long id;
        private String studentId;
        private String firstName;
        private String lastName;
        private String fullName;
        private String email;
        private String phone;
        private LocalDate dateOfBirth;
        private String course;
        private String semester;
        private String academicYear;
        private Student.StudentStatus status;
        private String address;
        private String guardianName;
        private String guardianPhone;
        private String createdBy;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        // Summary fee info
        private Long totalFeeRecords;
        private java.math.BigDecimal totalFeesDue;
        private java.math.BigDecimal totalFeesPaid;
        private java.math.BigDecimal outstandingBalance;
    }

    @Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
    public static class Summary {
        private Long id;
        private String studentId;
        private String fullName;
        private String course;
        private String academicYear;
        private Student.StudentStatus status;
    }
}
