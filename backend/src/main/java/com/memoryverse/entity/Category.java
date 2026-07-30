package com.memoryverse.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String name; // CERTIFICATE, RESUME, PROJECT_REPORT, INTERNSHIP_LETTER, etc.

    @Column(length = 255)
    private String description;

    @Column(length = 50)
    private String icon;
}
