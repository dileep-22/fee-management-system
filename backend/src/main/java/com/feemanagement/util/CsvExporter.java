package com.feemanagement.util;

import com.feemanagement.entity.FeeRecord;
import com.feemanagement.entity.Student;
import com.opencsv.CSVWriter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@Slf4j
public class CsvExporter {

    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    public byte[] exportFeeRecords(List<FeeRecord> records) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {

            // Header
            writer.writeNext(new String[]{
                "Receipt No", "Student ID", "Student Name", "Course",
                "Academic Year", "Semester", "Fee Category", "Total Amount",
                "Paid Amount", "Discount", "Fine", "Late Fee", "Balance",
                "Payment Status", "Payment Method", "Transaction ID",
                "Due Date", "Payment Date", "Created At", "Remarks"
            });

            for (FeeRecord r : records) {
                writer.writeNext(new String[]{
                    nvl(r.getReceiptNumber()),
                    r.getStudent().getStudentId(),
                    r.getStudent().getFullName(),
                    r.getStudent().getCourse(),
                    nvl(r.getAcademicYear()),
                    nvl(r.getSemester()),
                    r.getFeeCategory().getName(),
                    r.getTotalAmount().toString(),
                    r.getPaidAmount().toString(),
                    r.getDiscountAmount().toString(),
                    r.getFineAmount().toString(),
                    r.getLateFeeAmount() != null ? r.getLateFeeAmount().toString() : "0.00",
                    r.getBalanceAmount().toString(),
                    r.getPaymentStatus().name(),
                    nvl(r.getPaymentMethod()),
                    nvl(r.getTransactionId()),
                    r.getDueDate() != null ? r.getDueDate().format(DATE_FMT) : "",
                    r.getPaymentDate() != null ? r.getPaymentDate().format(DATE_FMT) : "",
                    r.getCreatedAt() != null ? r.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : "",
                    nvl(r.getRemarks())
                });
            }
        } catch (Exception e) {
            log.error("CSV export failed: {}", e.getMessage());
            throw new RuntimeException("Failed to export CSV", e);
        }
        return baos.toByteArray();
    }

    public byte[] exportStudents(List<Student> students) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try (CSVWriter writer = new CSVWriter(new OutputStreamWriter(baos, StandardCharsets.UTF_8))) {

            writer.writeNext(new String[]{
                "Student ID", "First Name", "Last Name", "Email", "Phone",
                "Date of Birth", "Course", "Semester", "Academic Year",
                "Status", "Guardian Name", "Guardian Phone", "Created At"
            });

            for (Student s : students) {
                writer.writeNext(new String[]{
                    s.getStudentId(), s.getFirstName(), s.getLastName(),
                    s.getEmail(), nvl(s.getPhone()),
                    s.getDateOfBirth() != null ? s.getDateOfBirth().format(DATE_FMT) : "",
                    s.getCourse(), nvl(s.getSemester()), nvl(s.getAcademicYear()),
                    s.getStatus().name(),
                    nvl(s.getGuardianName()), nvl(s.getGuardianPhone()),
                    s.getCreatedAt() != null ? s.getCreatedAt().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")) : ""
                });
            }
        } catch (Exception e) {
            log.error("Student CSV export failed: {}", e.getMessage());
            throw new RuntimeException("Failed to export students CSV", e);
        }
        return baos.toByteArray();
    }

    private String nvl(String s) { return s != null ? s : ""; }
}
