package com.techtitans.dayflow.document.repository;

import com.techtitans.dayflow.document.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {
    List<Document> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
}
