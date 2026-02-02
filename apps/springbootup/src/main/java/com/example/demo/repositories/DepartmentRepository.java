package com.example.demo.repositories;

import org.springframework.stereotype.Repository;

import com.example.demo.entity.Department;

import org.springframework.data.jpa.repository.JpaRepository;

@Repository
public interface DepartmentRepository extends JpaRepository<Department, Integer> {
}
