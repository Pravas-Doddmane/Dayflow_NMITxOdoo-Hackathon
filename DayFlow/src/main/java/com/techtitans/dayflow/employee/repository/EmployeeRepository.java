package com.techtitans.dayflow.employee.repository;

import com.techtitans.dayflow.employee.entity.Employee;
import com.techtitans.dayflow.user.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {

    Optional<Employee> findByUser(User user);

    Optional<Employee> findByUserId(Long userId);

    Optional<Employee> findByEmployeeCode(String employeeCode);

    Optional<Employee> findByEmployeeCodeAndCompanyId(String employeeCode, Long companyId);

    boolean existsByEmployeeCode(String employeeCode);

    boolean existsByEmployeeCodeAndCompanyId(String employeeCode, Long companyId);

    @Query("SELECT e FROM Employee e JOIN FETCH e.user u JOIN FETCH u.role WHERE e.company.id = :companyId")
    Page<Employee> findAllByCompanyIdWithUser(@org.springframework.data.repository.query.Param("companyId") Long companyId, Pageable pageable);

    @Query("SELECT e FROM Employee e JOIN FETCH e.user u JOIN FETCH u.role")
    Page<Employee> findAllWithUser(Pageable pageable);
}
