package com.swp391.service.impl;

import com.swp391.dto.dashboard.DashboardSummaryDTO;
import com.swp391.dto.dashboard.RevenueStatisticsDTO;
import com.swp391.dto.dashboard.TransactionReportItemDTO;
import com.swp391.dto.dashboard.TransactionStatisticsDTO;
import com.swp391.exception.BusinessException;
import com.swp391.repository.TransactionRepository;
import com.swp391.service.StatisticsService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StatisticsServiceImpl implements StatisticsService {

    private static final String[] EXPORT_HEADERS = {
            "Transaction ID",
            "Username",
            "Amount",
            "Transaction Type",
            "Status",
            "Created At"
    };

    private static final DateTimeFormatter EXPORT_DATE_TIME_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    private final TransactionRepository transactionRepository;

    @Override
    public RevenueStatisticsDTO getRevenueStatistics(LocalDate from, LocalDate to) {
        DateRange dateRange = buildDateRange(from, to);
        DashboardSummaryDTO summary = transactionRepository.getDashboardSummary(
                dateRange.fromDateTime(),
                dateRange.toDateTime()
        );
        return new RevenueStatisticsDTO(dateRange.from(), dateRange.to(), summary.getTotalRevenue());
    }

    @Override
    public TransactionStatisticsDTO getTransactionStatistics(LocalDate from, LocalDate to) {
        DateRange dateRange = buildDateRange(from, to);
        DashboardSummaryDTO summary = transactionRepository.getDashboardSummary(
                dateRange.fromDateTime(),
                dateRange.toDateTime()
        );
        List<TransactionReportItemDTO> transactions = transactionRepository.findTransactionReportItems(
                dateRange.fromDateTime(),
                dateRange.toDateTime()
        );

        return new TransactionStatisticsDTO(
                dateRange.from(),
                dateRange.to(),
                summary.getTotalTransactions(),
                summary.getSuccessfulTransactions(),
                summary.getFailedTransactions(),
                transactions
        );
    }

    @Override
    public DashboardSummaryDTO getDashboardSummary() {
        return transactionRepository.getDashboardSummary(null, null);
    }

    @Override
    public byte[] exportTransactionsToExcel(LocalDate from, LocalDate to) {
        DateRange dateRange = buildDateRange(from, to);
        List<TransactionReportItemDTO> transactions = transactionRepository.findTransactionReportItems(
                dateRange.fromDateTime(),
                dateRange.toDateTime()
        );

        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            XSSFSheet sheet = workbook.createSheet("Transactions");
            createExcelHeader(workbook, sheet);
            populateExcelRows(sheet, transactions);
            autoSizeColumns(sheet);
            workbook.write(outputStream);
            return outputStream.toByteArray();
        } catch (IOException e) {
            throw new BusinessException("Failed to export Excel file");
        }
    }

    @Override
    public byte[] exportTransactionsToCsv(LocalDate from, LocalDate to) {
        DateRange dateRange = buildDateRange(from, to);
        List<TransactionReportItemDTO> transactions = transactionRepository.findTransactionReportItems(
                dateRange.fromDateTime(),
                dateRange.toDateTime()
        );

        StringBuilder csvBuilder = new StringBuilder();
        csvBuilder.append('\uFEFF');
        csvBuilder.append(String.join(",", EXPORT_HEADERS)).append("\r\n");
        for (TransactionReportItemDTO transaction : transactions) {
            csvBuilder
                    .append(csvValue(transaction.getTransactionId()))
                    .append(',')
                    .append(csvValue(transaction.getUsername()))
                    .append(',')
                    .append(csvValue(transaction.getAmount()))
                    .append(',')
                    .append(csvValue(transaction.getTransactionType()))
                    .append(',')
                    .append(csvValue(transaction.getStatus()))
                    .append(',')
                    .append(csvValue(formatDateTime(transaction.getCreatedAt())))
                    .append("\r\n");
        }
        return csvBuilder.toString().getBytes(StandardCharsets.UTF_8);
    }

    private DateRange buildDateRange(LocalDate from, LocalDate to) {
        if (from != null && to != null && from.isAfter(to)) {
            throw new BusinessException("'from' date must be before or equal to 'to' date");
        }

        LocalDateTime fromDateTime = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDateTime = to != null ? to.atTime(LocalTime.MAX) : null;
        return new DateRange(from, to, fromDateTime, toDateTime);
    }

    private void createExcelHeader(XSSFWorkbook workbook, XSSFSheet sheet) {
        Row headerRow = sheet.createRow(0);
        CellStyle headerStyle = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        headerStyle.setFont(font);

        for (int i = 0; i < EXPORT_HEADERS.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(EXPORT_HEADERS[i]);
            cell.setCellStyle(headerStyle);
        }
    }

    private void populateExcelRows(XSSFSheet sheet, List<TransactionReportItemDTO> transactions) {
        int rowIndex = 1;
        for (TransactionReportItemDTO transaction : transactions) {
            Row row = sheet.createRow(rowIndex++);
            row.createCell(0).setCellValue(transaction.getTransactionId() != null ? transaction.getTransactionId() : 0);
            row.createCell(1).setCellValue(defaultString(transaction.getUsername()));
            row.createCell(2).setCellValue(transaction.getAmount() != null ? transaction.getAmount() : 0);
            row.createCell(3).setCellValue(defaultString(transaction.getTransactionType()));
            row.createCell(4).setCellValue(defaultString(transaction.getStatus()));
            row.createCell(5).setCellValue(formatDateTime(transaction.getCreatedAt()));
        }
    }

    private void autoSizeColumns(XSSFSheet sheet) {
        for (int i = 0; i < EXPORT_HEADERS.length; i++) {
            sheet.autoSizeColumn(i);
        }
    }

    private String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(EXPORT_DATE_TIME_FORMAT) : "";
    }

    private String defaultString(String value) {
        return value != null ? value : "";
    }

    private String csvValue(Object value) {
        String normalized = value == null ? "" : String.valueOf(value);
        return "\"" + normalized.replace("\"", "\"\"") + "\"";
    }

    private record DateRange(
            LocalDate from,
            LocalDate to,
            LocalDateTime fromDateTime,
            LocalDateTime toDateTime
    ) {
    }
}
