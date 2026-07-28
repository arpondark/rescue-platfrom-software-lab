package com.shazan.Nexora.dto.bulkupload;

import java.util.List;

public record BulkUploadResponse(
        Long batchId,
        int totalRows,
        int successCount,
        int failedCount,
        List<RowError> errors
) {
    public record RowError(int rowNumber, String error) {}
}
