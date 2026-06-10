package com.swp391.service.impl;

import com.swp391.dto.dashboard.DashboardSummaryDTO;
import com.swp391.dto.dashboard.RevenueStatisticResponse;
import com.swp391.dto.dashboard.TransactionReportItemDTO;
import com.swp391.dto.dashboard.TransactionReportResponse;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.sql.Date;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
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
    public List<RevenueStatisticResponse> getRevenueStatistics(LocalDate from, LocalDate to) {
        DateRange dateRange = buildDateRange(from, to);
        List<Object[]> rows = transactionRepository.findRevenueGroupedByDate(
                dateRange.fromDateTime(),
                dateRange.toDateTime()
        );

        List<RevenueStatisticResponse> result = new ArrayList<>();
        for (Object[] row : rows) {
            LocalDate date = toLocalDate(row[0]);
            Long revenue = row[1] != null ? ((Number) row[1]).longValue() : 0L;
            result.add(new RevenueStatisticResponse(date, revenue));
        }
        return result;
    }

    @Override
    public TransactionReportResponse getTransactionReport(LocalDate from, LocalDate to, int page, int size) {
        if (page < 0) {
            throw new BusinessException("Page index must be greater than or equal to 0");
        }
        if (size <= 0 || size > 100) {
            throw new BusinessException("Page size must be between 1 and 100");
        }

        DateRange dateRange = buildDateRange(from, to);
        DashboardSummaryDTO summary = transactionRepository.getDashboardSummary(
                dateRange.fromDateTime(),
                dateRange.toDateTime()
        );

        Pageable pageable = PageRequest.of(page, size);
        Page<TransactionReportItemDTO> transactionPage = transactionRepository.findTransactionReportItems(
                dateRange.fromDateTime(),
                dateRange.toDateTime(),
                pageable
        );

        return new TransactionReportResponse(
                dateRange.from(),
                dateRange.to(),
                summary.getTotalTransactions(),
                summary.getSuccessfulTransactions(),
                summary.getFailedTransactions(),
                transactionPage.getNumber(),
                transactionPage.getSize(),
                transactionPage.getTotalElements(),
                transactionPage.getTotalPages(),
                transactionPage.getContent()
        );
    }

    @Override
    public DashboardSummaryDTO getDashboardSummary() {
        return transactionRepository.getDashboardSummary(null, null);
    }

    @Override
    public byte[] exportTransactionsToExcel(LocalDate from, LocalDate to) {
        DateRange dateRange = buildDateRange(from, to);
        List<TransactionReportItemDTO> transactions = transactionRepository.findTransactionReportItemsForExport(
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
            throw new BusinessException("Failed to export Excel file: " + e.getMessage());
        }
    }

    @Override
    public byte[] exportTransactionsToCsv(LocalDate from, LocalDate to) {
        DateRange dateRange = buildDateRange(from, to);
        List<TransactionReportItemDTO> transactions = transactionRepository.findTransactionReportItemsForExport(
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
            throw new BusinessException("End date cannot be earlier than start date");
        }

        LocalDateTime fromDateTime = from != null ? from.atStartOfDay() : null;
        LocalDateTime toDateTime = to != null ? to.atTime(LocalTime.MAX) : null;
        return new DateRange(from, to, fromDateTime, toDateTime);
    }

    private LocalDate toLocalDate(Object value) {
        if (value == null) {
            return null;
        }
        if (value instanceof LocalDate localDate) {
            return localDate;
        }
        if (value instanceof Date sqlDate) {
            return sqlDate.toLocalDate();
        }
        if (value instanceof java.util.Date utilDate) {
            return new Date(utilDate.getTime()).toLocalDate();
        }
        return LocalDate.parse(value.toString());
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
