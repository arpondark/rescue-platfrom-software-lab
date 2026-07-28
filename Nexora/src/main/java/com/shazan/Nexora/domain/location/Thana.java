package com.shazan.Nexora.domain.location;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "thanas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Thana {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "bn_name")
    private String bnName;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "district_id", nullable = false)
    private District district;
}
