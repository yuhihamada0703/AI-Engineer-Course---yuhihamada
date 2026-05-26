package com.taskboard.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "cards")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CardEntity {

    @Id
    @Column(nullable = false, length = 255)
    private String id;

    @Column(nullable = false, length = 255)
    private String title;

    @Column(nullable = false, length = 4096)
    private String description = "";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "column_id", nullable = false)
    private ColumnEntity column;

    @Column(nullable = false)
    private int position;

    @Column(nullable = false, length = 10)
    private String priority = "MEDIUM";
}
