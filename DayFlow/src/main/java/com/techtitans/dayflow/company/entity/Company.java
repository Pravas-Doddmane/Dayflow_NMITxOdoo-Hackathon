package com.techtitans.dayflow.company.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "companies")
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "name", nullable = false, unique = true, length = 150)
    private String name;

    @Column(name = "code", nullable = false, unique = true, length = 50)
    private String code;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Column(name = "tagline", columnDefinition = "TEXT")
    private String tagline;

    @Column(name = "industry", length = 150)
    private String industry;

    @Column(name = "website", length = 255)
    private String website;

    @Column(name = "contact_email", length = 255)
    private String contactEmail;

    @Column(name = "phone", length = 50)
    private String phone;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "city", length = 100)
    private String city;

    @Column(name = "state", length = 100)
    private String state;

    @Column(name = "country", length = 100)
    private String country;

    @Column(name = "postal_code", length = 50)
    private String postalCode;

    @Column(name = "working_hours", length = 100)
    private String workingHours;

    @Column(name = "working_days", length = 100)
    private String workingDays;

    @Column(name = "about", columnDefinition = "TEXT")
    private String about;

    @Column(name = "leave_policy", columnDefinition = "TEXT")
    private String leavePolicy;

    @Column(name = "emergency_contact", columnDefinition = "TEXT")
    private String emergencyContact;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;
}
