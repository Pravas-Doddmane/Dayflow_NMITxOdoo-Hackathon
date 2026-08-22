package com.techtitans.dayflow.user.repository;

import com.techtitans.dayflow.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    List<User> findAllByEmail(String email);
    Optional<User> findFirstByEmail(String email);
    Optional<User> findByEmailAndCompanyId(String email, Long companyId);
    Optional<User> findByEmailAndCompany_NameIgnoreCase(String email, String companyName);
    boolean existsByEmail(String email);
    boolean existsByEmailAndCompanyId(String email, Long companyId);
    List<User> findByCompanyIdAndRole_Name(Long companyId, com.techtitans.dayflow.common.enums.RoleName roleName);
}
