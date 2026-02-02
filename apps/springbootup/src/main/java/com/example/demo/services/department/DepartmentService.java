package com.example.demo.services.department;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.demo.common.EntityDtoMapper;
import com.example.demo.dto.DepartmentDto;
import com.example.demo.entity.Department;
import com.example.demo.repositories.DepartmentRepository;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class DepartmentService {

  private final DepartmentRepository departmentRepository;
  private final EntityDtoMapper mapper;

  public DepartmentDto getDepartment(int id) {
    Department department = departmentRepository.findById(id)
        .orElseThrow(() -> new EntityNotFoundException("Department not found"));
    return mapper.convertToDto(department, DepartmentDto.class);
  }

  public List<DepartmentDto> getAllDepartments() {
    return departmentRepository.findAll().stream()
        .map(dept -> mapper.convertToDto(dept, DepartmentDto.class))
        .collect(Collectors.toList());
  }

  public List<Department> findAll() {
    return departmentRepository.findAll();
  }

  public Department findById(int theId) {
    return departmentRepository.findById(theId).orElse(null);
  }

  public Department save(Department theDepartment) {
    Department savedDepartment = departmentRepository.save(theDepartment);
    return savedDepartment;
  }

  public void deleteById(int theId) {
    departmentRepository.deleteById(theId);
  }

  public void deleteAll() {
    departmentRepository.deleteAll();
  }

}
