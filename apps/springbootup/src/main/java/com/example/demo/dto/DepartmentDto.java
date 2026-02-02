package com.example.demo.dto;

import lombok.Data;

@Data
public class DepartmentDto {
  private int id;
  private String departmentCode;
  private String departmentName;
  private String location;
  private Boolean active;
}
