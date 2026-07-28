package com.shazan.Nexora.repository.bulkupload;

import com.shazan.Nexora.domain.bulkupload.BulkUploadBatch;
import com.shazan.Nexora.domain.ngo.Ngo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BulkUploadBatchRepository extends JpaRepository<BulkUploadBatch, Long> {
    List<BulkUploadBatch> findAllByNgoOrderByCreatedAtDesc(Ngo ngo);
}
