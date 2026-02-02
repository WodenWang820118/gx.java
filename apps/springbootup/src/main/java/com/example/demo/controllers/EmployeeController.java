package com.example.demo.controllers;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.EmployeeDto;
import com.example.demo.entity.Employee;
import com.example.demo.services.employee.EmployeeService;

@RestController
@RequestMapping(path = "/employees", produces = MediaType.APPLICATION_JSON_VALUE)
public class EmployeeController {

  private EmployeeService employeeService;

  public EmployeeController(EmployeeService theEmployeeService) {
    employeeService = theEmployeeService;
  }

  @GetMapping("/list")
  public List<Employee> listEmployees() {
    return employeeService.findAll();
  }

  @GetMapping("/get/{id}")
  public ResponseEntity<EmployeeDto> getEmployee(@PathVariable("id") int theId) {
    EmployeeDto savedEmployee = employeeService.getEmployee(theId);
    return ResponseEntity.ok(savedEmployee);
  }

  @PostMapping("/save")
  public ResponseEntity<Employee> saveEmployee(@RequestBody Employee theEmployee) {
    Employee savedEmployee = employeeService.save(theEmployee);
    return ResponseEntity.ok(savedEmployee);
  }

  @GetMapping("/delete/{id}")
  public ResponseEntity<String> delete(@PathVariable("id") int theId) {
    Employee employee = employeeService.findById(theId);

    // Check if employee exists before attempting to delete
    if (employee == null) {
      return ResponseEntity
          .status(HttpStatus.NOT_FOUND)
          .body("Employee with ID " + theId + " not found");
    }

    // Perform deletion
    employeeService.deleteById(theId);

    // Verify deletion
    if (employeeService.findById(theId) == null) {
      return ResponseEntity
          .ok()
          .body("Employee with ID " + theId + " deleted successfully");
    } else {
      return ResponseEntity
          .status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body("Failed to delete employee with ID " + theId);
    }
  }
}
