package com.techtitans.dayflow.attendance.repository;

import com.techtitans.dayflow.attendance.entity.Attendance;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long>, JpaSpecificationExecutor<Attendance> {

    Optional<Attendance> findByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);

    boolean existsByEmployeeIdAndAttendanceDate(Long employeeId, LocalDate date);

    List<Attendance> findByEmployeeIdOrderByAttendanceDateDesc(Long employeeId);

    @Query("SELECT a FROM Attendance a WHERE a.employee.id = :employeeId " +
           "AND a.attendanceDate BETWEEN :from AND :to ORDER BY a.attendanceDate DESC")
    List<Attendance> findByEmployeeIdAndDateRange(
            @Param("employeeId") Long employeeId,
            @Param("from") LocalDate from,
            @Param("to") LocalDate to);
}
