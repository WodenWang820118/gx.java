# DAO (Data Access Object) Layer

## Complex Database Operations

```java
@Repository
public class EmployeeDAO {
    @PersistenceContext
    private EntityManager entityManager;

    public List<Employee> findEmployeesByComplexCriteria() {
        // Custom complex query implementation
    }
}
```

## Multiple Data Sources

```java
@Repository
public class EmployeeDAO {
    @Autowired
    private DataSource primaryDS;

    @Autowired
    private DataSource secondaryDS;

    // Custom implementations for different data sources
}
```

## Best Practices

```java
@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Integer> {
    // Basic CRUD from JpaRepository
}

@Repository
public class EmployeeDAO {
    // Complex custom operations
}

```
