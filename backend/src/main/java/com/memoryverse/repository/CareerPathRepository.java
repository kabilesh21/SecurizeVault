package com.memoryverse.repository;

import com.memoryverse.entity.CareerPath;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CareerPathRepository extends JpaRepository<CareerPath, Long> {
    Optional<CareerPath> findByName(String name);
}
