import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Department } from '../models/organization.models';

/**
 * Service for interacting with the springbootup Department REST API.
 * Provides methods to retrieve and manage department information.
 */
@Injectable({
  providedIn: 'root',
})
export class DepartmentService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/departments';

  /**
   * Get all departments
   */
  getAllDepartments(): Observable<Department[]> {
    return this.http.get<Department[]>(this.baseUrl);
  }

  /**
   * Get department by ID
   */
  getDepartmentById(id: number): Observable<Department> {
    return this.http.get<Department>(`${this.baseUrl}/${id}`);
  }

  /**
   * Get department by code
   */
  getDepartmentByCode(code: string): Observable<Department> {
    return this.http.get<Department>(`${this.baseUrl}/code/${code}`);
  }

  /**
   * Create a new department
   */
  createDepartment(department: Omit<Department, 'id'>): Observable<Department> {
    return this.http.post<Department>(this.baseUrl, department);
  }

  /**
   * Update an existing department
   */
  updateDepartment(id: number, department: Department): Observable<Department> {
    return this.http.put<Department>(`${this.baseUrl}/${id}`, department);
  }

  /**
   * Delete a department
   */
  deleteDepartment(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
