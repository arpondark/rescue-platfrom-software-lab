package com.shazan.Nexora.email;

import com.shazan.Nexora.domain.event.DisasterEvent;
import com.shazan.Nexora.domain.event.EventInvitation;
import com.shazan.Nexora.domain.ngo.Ngo;
import com.shazan.Nexora.domain.volunteer.Volunteer;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String from;

    private static final DateTimeFormatter TS =
            DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a").withZone(java.time.ZoneId.of("Asia/Dhaka"));

    @Async("taskExecutor")
    public void sendVolunteerAddedByNgo(Volunteer volunteer, Ngo ngo, String setPasswordUrl) {
        String body = """
                <div style="font-family:Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto">
                  <h2 style="color:#0f172a">Welcome to Nexora</h2>
                  <p>Hi <b>%s</b>,</p>
                  <p><b>%s</b> has added you to the Nexora volunteer network. You can now be invited to disaster response events in your area.</p>
                  <p>Set your password to activate your account:</p>
                  <p><a href="%s" style="background:#0ea5e9;color:white;padding:10px 16px;border-radius:8px;text-decoration:none">Set my password</a></p>
                  <hr/>
                  <p style="color:#64748b;font-size:12px">If you weren't expecting this, you can ignore this email.</p>
                </div>
                """.formatted(volunteer.getName(), ngo.getName(), setPasswordUrl);
        send(volunteer.getEmail(), "You've been added as a Nexora volunteer", body);
    }

    @Async("taskExecutor")
    public void sendEventInvitation(EventInvitation inv, DisasterEvent event, String acceptUrl) {
        String body = """
                <div style="font-family:Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto">
                  <h2 style="color:#0f172a">Disaster Event Invitation</h2>
                  <p>Hi <b>%s</b>,</p>
                  <p><b>%s</b> has invited you to help with:</p>
                  <h3>%s</h3>
                  <p><b>Type:</b> %s &nbsp; <b>Severity:</b> %s</p>
                  <p><b>Start:</b> %s<br/><b>End:</b> %s</p>
                  <p>%s</p>
                  <p><a href="%s" style="background:#16a34a;color:white;padding:10px 16px;border-radius:8px;text-decoration:none">View &amp; respond</a></p>
                </div>
                """.formatted(
                        inv.getVolunteer().getName(),
                        inv.getNgo().getName(),
                        event.getTitle(),
                        event.getType(),
                        event.getSeverity(),
                        TS.format(event.getStartAt()),
                        TS.format(event.getEndAt()),
                        event.getDescription() == null ? "" : event.getDescription(),
                        acceptUrl
                );
        send(inv.getVolunteer().getEmail(), "Invitation: " + event.getTitle(), body);
    }

    @Async("taskExecutor")
    public void sendNgoApproval(Ngo ngo, boolean approved, String reason, String loginUrl) {
        sendNgoApproval(ngo, approved ? ApprovalOutcome.APPROVED : ApprovalOutcome.REJECTED, reason, loginUrl);
    }

    @Async("taskExecutor")
    public void sendNgoApproval(Ngo ngo, ApprovalOutcome outcome, String reason, String loginUrl) {
        switch (outcome) {
            case APPROVED -> {
                String subject = "Your NGO has been approved!";
                String body = """
                  <div style="font-family:Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto">
                    <h2 style="color:#16a34a">Welcome aboard, %s!</h2>
                    <p>Your NGO has been approved by the Nexora Super Admin. You can now log in and start recruiting volunteers and creating disaster events.</p>
                    <p><a href="%s" style="background:#0ea5e9;color:white;padding:10px 16px;border-radius:8px;text-decoration:none">Login now</a></p>
                  </div>
                  """.formatted(ngo.getName(), loginUrl);
                send(ngo.getEmail(), subject, body);
            }
            case PENDING -> {
                String subject = "Your NGO registration is pending review";
                String body = """
                  <div style="font-family:Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto">
                    <h2 style="color:#0ea5e9">Registration received</h2>
                    <p>Hi %s,</p>
                    <p>Thank you for registering your NGO with Nexora. Your application has been received and is now awaiting Super Admin review.</p>
                    <p>You will receive another email as soon as your account has been approved. Most reviews are completed within one business day.</p>
                    <p>If you don't hear back within 48 hours, please reply to this email.</p>
                  </div>
                  """.formatted(ngo.getName());
                send(ngo.getEmail(), subject, body);
            }
            case REJECTED -> {
                String subject = "Your NGO registration was rejected";
                String body = """
                  <div style="font-family:Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto">
                    <h2 style="color:#dc2626">Registration rejected</h2>
                    <p>Hi %s,</p>
                    <p>Unfortunately your NGO registration was rejected.</p>
                    <p><b>Reason:</b> %s</p>
                  </div>
                  """.formatted(ngo.getName(), reason == null ? "Not specified" : reason);
                send(ngo.getEmail(), subject, body);
            }
        }
    }

    public enum ApprovalOutcome {
        APPROVED, PENDING, REJECTED
    }

    @Async("taskExecutor")
    public void sendVolunteerPendingReview(Volunteer volunteer, String loginUrl) {
        String body = """
                <div style="font-family:Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto">
                  <h2 style="color:#0ea5e9">Registration received</h2>
                  <p>Hi <b>%s</b>,</p>
                  <p>Thank you for registering as a Nexora volunteer. Your application is now awaiting review by the Nexora Super Admin.</p>
                  <p>You will receive another email as soon as your account is approved. Most reviews are completed within one business day.</p>
                  <p>After approval, you can sign in at <a href="%s">%s</a> and start receiving invitations from NGOs in your area.</p>
                </div>
                """.formatted(volunteer.getName(), loginUrl, loginUrl);
        send(volunteer.getEmail(), "Your volunteer registration is pending review", body);
    }

    @Async("taskExecutor")
    public void sendVolunteerApproved(Volunteer volunteer, String loginUrl) {
        String body = """
                <div style="font-family:Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto">
                  <h2 style="color:#16a34a">You're approved!</h2>
                  <p>Hi <b>%s</b>,</p>
                  <p>Your Nexora volunteer account has been approved by the Super Admin. You can now sign in and accept invitations from NGOs in your area.</p>
                  <p><a href="%s" style="background:#0ea5e9;color:white;padding:10px 16px;border-radius:8px;text-decoration:none">Login now</a></p>
                </div>
                """.formatted(volunteer.getName(), loginUrl);
        send(volunteer.getEmail(), "Your volunteer account has been approved", body);
    }

    @Async("taskExecutor")
    public void sendVolunteerRejected(Volunteer volunteer, String reason) {
        String body = """
                <div style="font-family:Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto">
                  <h2 style="color:#dc2626">Application rejected</h2>
                  <p>Hi <b>%s</b>,</p>
                  <p>Unfortunately your volunteer application was rejected.</p>
                  <p><b>Reason:</b> %s</p>
                  <p>If you believe this was a mistake, please reply to this email.</p>
                </div>
                """.formatted(volunteer.getName(), reason == null ? "Not specified" : reason);
        send(volunteer.getEmail(), "Your volunteer application was rejected", body);
    }

    @Async("taskExecutor")
    public void sendVolunteerResponseToNgo(Ngo ngo, Volunteer volunteer, String eventTitle, boolean accepted) {
        String body = """
                <div style="font-family:Segoe UI,Roboto,sans-serif;max-width:560px;margin:auto">
                  <h2>%s</h2>
                  <p>Volunteer <b>%s</b> has <b>%s</b> your invitation to event <i>%s</i>.</p>
                </div>
                """.formatted(
                accepted ? "Volunteer accepted" : "Volunteer declined",
                volunteer.getName(),
                accepted ? "ACCEPTED" : "DECLINED",
                eventTitle);
        send(ngo.getEmail(), "Event update: " + eventTitle, body);
    }

    private void send(String to, String subject, String html) {
        try {
            MimeMessage msg = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(msg, true, StandardCharsets.UTF_8.name());
            helper.setFrom(from == null || from.isBlank() ? "no-reply@nexora.bd" : from);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(html, true);
            mailSender.send(msg);
            log.info("Email sent to {} subject={}", to, subject);
        } catch (MessagingException ex) {
            log.error("Failed to send email to {} subject={}", to, subject, ex);
        }
    }
}