package com.memoryverse.repository;

import com.memoryverse.entity.PortfolioLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PortfolioLinkRepository extends JpaRepository<PortfolioLink, Long> {
    List<PortfolioLink> findByUserId(Long userId);
    Optional<PortfolioLink> findByIdAndUserId(Long id, Long userId);
    long countByUserIdAndPlatformName(Long userId, String platformName);
    Optional<PortfolioLink> findByUserIdAndPlatformName(Long userId, String platformName);
}
