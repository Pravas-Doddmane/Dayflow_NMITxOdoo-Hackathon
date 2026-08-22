package com.techtitans.dayflow.user.repository;

import com.techtitans.dayflow.common.enums.RoleName;
import com.techtitans.dayflow.user.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleName name);
}
