package com.example.demo.services.employee;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.common.EntityDtoMapper;
import com.example.demo.dto.EmployeeDto;
import com.example.demo.entity.Employee;
import com.example.demo.repositories.EmployeeRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class EmployeeService {

  private final EmployeeRepository employeeRepository;
  private final EntityDtoMapper mapper;

  public EmployeeDto getEmployee(int id) {
    Employee employee = employeeRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Employee not found"));
    return mapper.convertToDto(employee, EmployeeDto.class);
  }

  public List<EmployeeDto> getAllEmployees() {
    return employeeRepository.findAll().stream()
        .map(emp -> mapper.convertToDto(emp, EmployeeDto.class))
        .collect(Collectors.toList());
  }

  public List<Employee> findAll() {
    return employeeRepository.findAll();
  }

  public Employee findById(int theId) {
    return employeeRepository.findById(theId).orElse(null);
  }

  public Employee save(Employee theEmployee) {
    Employee savedEmployee = employeeRepository.save(theEmployee);
    return savedEmployee;
  }

  public void deleteById(int theId) {
    employeeRepository.deleteById(theId);
  }

}
