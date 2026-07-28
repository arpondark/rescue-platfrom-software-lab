package com.shazan.Nexora.domain.location;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "divisions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Division {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(name = "bn_name")
    private String bnName;
}
