package com.shazan.Nexora.domain.bulkupload;

import com.shazan.Nexora.common.BaseEntity;
import com.shazan.Nexora.domain.ngo.Ngo;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "bulk_upload_batches")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BulkUploadBatch extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ngo_id", nullable = false)
    private Ngo ngo;

    @Column(name = "filename", nullable = false, length = 255)
    private String filename;

    @Column(name = "total_rows", nullable = false)
    private int totalRows;

    @Column(name = "success_count", nullable = false)
    private int successCount;

    @Column(name = "failed_count", nullable = false)
    private int failedCount;

    @Column(name = "errors_json", columnDefinition = "TEXT")
    private String errorsJson;
}
