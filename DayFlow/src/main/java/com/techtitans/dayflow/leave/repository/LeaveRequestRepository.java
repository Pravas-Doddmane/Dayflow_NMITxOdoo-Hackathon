package com.techtitans.dayflow.leave.repository;

import com.techtitans.dayflow.common.enums.LeaveStatus;
import com.techtitans.dayflow.leave.entity.LeaveRequest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface LeaveRequestRepository extends JpaRepository<LeaveRequest, Long>, JpaSpecificationExecutor<LeaveRequest> {

    List<LeaveRequest> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);

    Page<LeaveRequest> findByStatusOrderByCreatedAtDesc(LeaveStatus status, Pageable pageable);

    Page<LeaveRequest> findAllByOrderByCreatedAtDesc(Pageable pageable);

    @Query("SELECT l FROM LeaveRequest l JOIN FETCH l.employee e WHERE " +
           "(:companyId IS NULL OR e.company.id = :companyId) " +
           "AND (:status IS NULL OR l.status = :status) " +
           "ORDER BY l.createdAt DESC")
    Page<LeaveRequest> findAllByCompanyIdAndStatus(
            @Param("companyId") Long companyId,
            @Param("status") LeaveStatus status,
            Pageable pageable);

    // Check overlapping leave requests for an employee
    @Query("SELECT COUNT(l) > 0 FROM LeaveRequest l WHERE l.employee.id = :employeeId " +
           "AND l.status != 'REJECTED' " +
           "AND l.startDate <= :endDate AND l.endDate >= :startDate")
    boolean existsOverlappingLeave(
            @Param("employeeId") Long employeeId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate);
}
