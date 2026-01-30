package com.gx.user.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import lombok.Builder;
import lombok.Data;

@Entity
@Data
@Builder
public class PortfolioItem {
    @Id
    @GeneratedValue
    private Integer id;

    @Column(name = "customer_id")
    private Integer userId;
    private String ticker;
    private Integer quantity;
}
