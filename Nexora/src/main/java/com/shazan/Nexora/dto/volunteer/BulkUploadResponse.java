package com.shazan.Nexora.dto.volunteer;

import java.util.List;

/**
 * Result of a bulk CSV volunteer import. Each row is processed independently —
 * a failed row does not abort the rest. The caller gets counts plus a per-row
 * error list (rowNumber matches the original CSV row including header lines).
 */
public record BulkUploadResponse(
        Long batchId,
        int totalRows,
        int successCount,
        int failedCount,
        List<RowError> errors
) {
    public record RowError(int rowNumber, String error) {}
}