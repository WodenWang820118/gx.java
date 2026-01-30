package com.gx.user.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name = "customer")
@Data
public class User {
    @Id
    private Integer id;
    private String name;
    private Integer balance;
}
