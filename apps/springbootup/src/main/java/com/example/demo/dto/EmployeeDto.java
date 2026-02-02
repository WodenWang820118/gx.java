package com.example.demo.dto;

import lombok.Data;

@Data
public class EmployeeDto {
  private int id;
  private String firstName;
  private String lastName;
  private String email;
  private DepartmentDto department;
}
