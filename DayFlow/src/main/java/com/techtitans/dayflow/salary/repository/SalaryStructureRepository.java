package com.techtitans.dayflow.salary.repository;

import com.techtitans.dayflow.salary.entity.SalaryStructure;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SalaryStructureRepository extends JpaRepository<SalaryStructure, Long> {

    List<SalaryStructure> findByEmployeeIdOrderByEffectiveFromDesc(Long employeeId);

    Optional<SalaryStructure> findTopByEmployeeIdOrderByEffectiveFromDesc(Long employeeId);
}
