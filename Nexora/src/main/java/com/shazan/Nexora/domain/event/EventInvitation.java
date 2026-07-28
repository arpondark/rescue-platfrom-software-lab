package com.shazan.Nexora.domain.event;

import com.shazan.Nexora.common.BaseEntity;
import com.shazan.Nexora.domain.enums.InvitationStatus;
import com.shazan.Nexora.domain.ngo.Ngo;
import com.shazan.Nexora.domain.volunteer.Volunteer;
import jakarta.persistence.*;
import lombok.*;

import java.time.Instant;

@Entity
@Table(name = "event_invitations",
        uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "volunteer_id"}))
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventInvitation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "event_id", nullable = false)
    private DisasterEvent event;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "volunteer_id", nullable = false)
    private Volunteer volunteer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ngo_id", nullable = false)
    private Ngo ngo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private InvitationStatus status;

    @Column(name = "responded_at")
    private Instant respondedAt;

    @PrePersist
    private void prePersist() {
        if (status == null) status = InvitationStatus.INVITED;
    }
}
