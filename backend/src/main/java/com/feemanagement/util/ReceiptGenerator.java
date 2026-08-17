package com.feemanagement.util;

import com.feemanagement.entity.FeeRecord;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.*;
import com.itextpdf.layout.properties.HorizontalAlignment;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;

@Component
@Slf4j
public class ReceiptGenerator {

    private static final DeviceRgb PRIMARY_COLOR = new DeviceRgb(51, 102, 232);
    private static final DeviceRgb LIGHT_GRAY    = new DeviceRgb(248, 250, 252);
    private static final DeviceRgb DARK_GRAY     = new DeviceRgb(30, 41, 59);
    private static final DeviceRgb GREEN         = new DeviceRgb(34, 197, 94);
    private static final DateTimeFormatter DATE_FMT = DateTimeFormatter.ofPattern("dd MMM yyyy");

    public byte[] generateReceipt(FeeRecord record) {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        try {
            PdfWriter writer   = new PdfWriter(baos);
            PdfDocument pdf    = new PdfDocument(writer);
            Document document  = new Document(pdf, PageSize.A4);
            document.setMargins(40, 40, 40, 40);

            PdfFont bold    = PdfFontFactory.createFont("Helvetica-Bold");
            PdfFont regular = PdfFontFactory.createFont("Helvetica");

            // ── Header ─────────────────────────────────────────────────────────
            Table header = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                    .setWidth(UnitValue.createPercentValue(100));

            Cell logoCell = new Cell().setBorder(Border.NO_BORDER);
            logoCell.add(new Paragraph("FeeManage Pro")
                    .setFont(bold).setFontSize(22).setFontColor(PRIMARY_COLOR));
            logoCell.add(new Paragraph("Fee Management System")
                    .setFont(regular).setFontSize(10).setFontColor(ColorConstants.GRAY));
            header.addCell(logoCell);

            Cell receiptCell = new Cell().setBorder(Border.NO_BORDER)
                    .setTextAlignment(TextAlignment.RIGHT);
            receiptCell.add(new Paragraph("PAYMENT RECEIPT")
                    .setFont(bold).setFontSize(16).setFontColor(DARK_GRAY));
            receiptCell.add(new Paragraph("# " + record.getReceiptNumber())
                    .setFont(bold).setFontSize(11).setFontColor(PRIMARY_COLOR));
            header.addCell(receiptCell);

            document.add(header);

            // Divider
            document.add(new LineSeparator(new com.itextpdf.kernel.pdf.canvas.draw.SolidLine(1f))
                    .setMarginTop(10).setMarginBottom(10));

            // ── Status badge ───────────────────────────────────────────────────
            String statusText = record.getPaymentStatus().name();
            DeviceRgb statusColor = switch (record.getPaymentStatus()) {
                case PAID    -> GREEN;
                case PARTIAL -> new DeviceRgb(245, 158, 11);
                case OVERDUE -> new DeviceRgb(239, 68, 68);
                default      -> new DeviceRgb(100, 116, 139);
            };
            document.add(new Paragraph(statusText)
                    .setFont(bold).setFontSize(10).setFontColor(statusColor)
                    .setBackgroundColor(LIGHT_GRAY).setPadding(6).setBorderRadius(
                            new com.itextpdf.layout.properties.BorderRadius(4)));

            // ── Student Info ───────────────────────────────────────────────────
            document.add(new Paragraph("Student Information")
                    .setFont(bold).setFontSize(12).setFontColor(DARK_GRAY).setMarginTop(16));

            Table infoTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setBackgroundColor(LIGHT_GRAY).setPadding(12);

            addInfoRow(infoTable, "Student Name",   record.getStudent().getFullName(),   bold, regular);
            addInfoRow(infoTable, "Student ID",     record.getStudent().getStudentId(),  bold, regular);
            addInfoRow(infoTable, "Course",         record.getStudent().getCourse(),     bold, regular);
            addInfoRow(infoTable, "Academic Year",  nvl(record.getAcademicYear()),       bold, regular);
            addInfoRow(infoTable, "Semester",       nvl(record.getSemester()),           bold, regular);
            addInfoRow(infoTable, "Email",          record.getStudent().getEmail(),      bold, regular);
            document.add(infoTable);

            // ── Fee Details ────────────────────────────────────────────────────
            document.add(new Paragraph("Fee Details")
                    .setFont(bold).setFontSize(12).setFontColor(DARK_GRAY).setMarginTop(20));

            Table feeTable = new Table(UnitValue.createPercentArray(new float[]{60, 40}))
                    .setWidth(UnitValue.createPercentValue(100));

            feeTableHeader(feeTable, bold);
            addFeeRow(feeTable, record.getFeeCategory().getName(),
                    record.getTotalAmount(), regular, false);
            if (record.getDiscountAmount().compareTo(BigDecimal.ZERO) > 0)
                addFeeRow(feeTable, "Discount", record.getDiscountAmount().negate(), regular, false);
            if (record.getFineAmount().compareTo(BigDecimal.ZERO) > 0)
                addFeeRow(feeTable, "Fine", record.getFineAmount(), regular, false);
            if (record.getLateFeeAmount() != null && record.getLateFeeAmount().compareTo(BigDecimal.ZERO) > 0)
                addFeeRow(feeTable, "Late Fee", record.getLateFeeAmount(), regular, false);

            // Total row
            Cell totalLabel = new Cell().setBorder(Border.NO_BORDER)
                    .setBackgroundColor(PRIMARY_COLOR).setPadding(8);
            totalLabel.add(new Paragraph("Total Due").setFont(bold).setFontSize(11)
                    .setFontColor(ColorConstants.WHITE));
            feeTable.addCell(totalLabel);

            Cell totalVal = new Cell().setBorder(Border.NO_BORDER)
                    .setBackgroundColor(PRIMARY_COLOR).setPadding(8)
                    .setTextAlignment(TextAlignment.RIGHT);
            totalVal.add(new Paragraph("₹ " + formatAmount(record.getBalanceAmount()
                    .add(record.getPaidAmount())))
                    .setFont(bold).setFontSize(11).setFontColor(ColorConstants.WHITE));
            feeTable.addCell(totalVal);

            document.add(feeTable);

            // ── Payment Summary ────────────────────────────────────────────────
            document.add(new Paragraph("Payment Summary")
                    .setFont(bold).setFontSize(12).setFontColor(DARK_GRAY).setMarginTop(20));

            Table payTable = new Table(UnitValue.createPercentArray(new float[]{50, 50}))
                    .setWidth(UnitValue.createPercentValue(100))
                    .setBackgroundColor(LIGHT_GRAY).setPadding(12);

            addInfoRow(payTable, "Amount Paid",   "₹ " + formatAmount(record.getPaidAmount()),        bold, regular);
            addInfoRow(payTable, "Balance",       "₹ " + formatAmount(record.getBalanceAmount()),      bold, regular);
            addInfoRow(payTable, "Payment Method", nvl(record.getPaymentMethod()),                     bold, regular);
            if (record.getTransactionId() != null)
                addInfoRow(payTable, "Transaction ID", record.getTransactionId(), bold, regular);
            if (record.getPaymentDate() != null)
                addInfoRow(payTable, "Payment Date", record.getPaymentDate().format(DATE_FMT), bold, regular);
            if (record.getDueDate() != null)
                addInfoRow(payTable, "Due Date", record.getDueDate().format(DATE_FMT), bold, regular);
            document.add(payTable);

            // ── Footer ─────────────────────────────────────────────────────────
            document.add(new LineSeparator(new com.itextpdf.kernel.pdf.canvas.draw.SolidLine(0.5f))
                    .setMarginTop(20).setMarginBottom(8));
            document.add(new Paragraph("This is a computer-generated receipt and does not require a signature.")
                    .setFont(regular).setFontSize(8).setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER));
            document.add(new Paragraph("Generated on: " + java.time.LocalDateTime.now()
                    .format(DateTimeFormatter.ofPattern("dd MMM yyyy HH:mm:ss")))
                    .setFont(regular).setFontSize(8).setFontColor(ColorConstants.GRAY)
                    .setTextAlignment(TextAlignment.CENTER));

            document.close();
            log.info("Receipt generated for record {} ({})", record.getId(), record.getReceiptNumber());
        } catch (Exception e) {
            log.error("Failed to generate receipt for record {}: {}", record.getId(), e.getMessage());
            throw new RuntimeException("Failed to generate PDF receipt", e);
        }
        return baos.toByteArray();
    }

    private void feeTableHeader(Table t, PdfFont bold) {
        Cell h1 = new Cell().setBackgroundColor(DARK_GRAY).setPadding(8).setBorder(Border.NO_BORDER);
        h1.add(new Paragraph("Description").setFont(bold).setFontSize(10).setFontColor(ColorConstants.WHITE));
        t.addCell(h1);
        Cell h2 = new Cell().setBackgroundColor(DARK_GRAY).setPadding(8).setBorder(Border.NO_BORDER)
                .setTextAlignment(TextAlignment.RIGHT);
        h2.add(new Paragraph("Amount").setFont(bold).setFontSize(10).setFontColor(ColorConstants.WHITE));
        t.addCell(h2);
    }

    private void addFeeRow(Table t, String label, BigDecimal amt, PdfFont font, boolean bold) {
        t.addCell(new Cell().setBorder(Border.NO_BORDER).setPaddingTop(6).setPaddingBottom(6)
                .add(new Paragraph(label).setFont(font).setFontSize(10)));
        t.addCell(new Cell().setBorder(Border.NO_BORDER).setPaddingTop(6).setPaddingBottom(6)
                .setTextAlignment(TextAlignment.RIGHT)
                .add(new Paragraph("₹ " + formatAmount(amt)).setFont(font).setFontSize(10)));
    }

    private void addInfoRow(Table t, String key, String value, PdfFont bold, PdfFont regular) {
        t.addCell(new Cell().setBorder(Border.NO_BORDER).setPadding(4)
                .add(new Paragraph(key).setFont(bold).setFontSize(9).setFontColor(ColorConstants.GRAY)));
        t.addCell(new Cell().setBorder(Border.NO_BORDER).setPadding(4)
                .add(new Paragraph(value).setFont(regular).setFontSize(9).setFontColor(DARK_GRAY)));
    }

    private String formatAmount(BigDecimal amount) {
        if (amount == null) return "0.00";
        return String.format("%,.2f", amount);
    }

    private String nvl(String s) { return s != null ? s : "—"; }
}
