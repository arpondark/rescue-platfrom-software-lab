package com.shazan.Nexora.domain.admin;

import com.shazan.Nexora.common.BaseEntity;
import com.shazan.Nexora.domain.enums.Role;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "super_admins")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SuperAdmin extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @PrePersist
    private void prePersist() {
        if (role == null) role = Role.ROLE_SUPER_ADMIN;
    }
}
