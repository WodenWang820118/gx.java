package com.example.demo.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.DepartmentDto;
import com.example.demo.entity.Department;
import com.example.demo.services.department.DepartmentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "/departments", produces = MediaType.APPLICATION_JSON_VALUE)
public class DepartmentController {

  private DepartmentService departmentService;

  public DepartmentController(DepartmentService theDepartmentService) {
    departmentService = theDepartmentService;
  }

  @GetMapping("/list")
  public List<DepartmentDto> listDepartments() {
    return departmentService.getAllDepartments();
  }

  @GetMapping("/get/{id}")
  public ResponseEntity<DepartmentDto> getDepartment(@PathVariable("id") int id) {
    DepartmentDto department = departmentService.getDepartment(id);
    return ResponseEntity.ok(department);
  }

  @PostMapping("/save")
  public ResponseEntity<Department> saveDepartment(@Valid @RequestBody Department theDepartment) {
    if (theDepartment.getDepartmentCode().length() > 10) {
      return ResponseEntity
          .status(HttpStatus.BAD_REQUEST)
          .body(null);
    }

    Department savedDepartment = departmentService.save(theDepartment);
    return ResponseEntity.ok(savedDepartment);
  }

  @DeleteMapping("/delete/{id}")
  public ResponseEntity<String> delete(@PathVariable("id") int id) {
    Department department = departmentService.findById(id);

    // Check if department exists before attempting to delete
    if (department == null) {
      return ResponseEntity
          .status(HttpStatus.NOT_FOUND)
          .body("Department with ID " + id + " not found");
    }

    // Perform deletion
    departmentService.deleteById(id);

    // Verify deletion
    if (departmentService.findById(id) == null) {
      return ResponseEntity
          .ok()
          .body("Department with ID " + id + " deleted successfully");
    } else {
      return ResponseEntity
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Failed to delete department with ID " + id);
    }
  }

  @DeleteMapping("/deleteAll")
  public ResponseEntity<String> deleteAll() {
    departmentService.deleteAll();
    return ResponseEntity.ok("All departments deleted successfully");
  }
}
