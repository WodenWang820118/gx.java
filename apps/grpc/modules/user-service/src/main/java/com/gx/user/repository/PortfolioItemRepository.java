package com.gx.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.repository.CrudRepository;
import org.springframework.stereotype.Repository;

import com.gx.user.entity.PortfolioItem;

@Repository
public interface PortfolioItemRepository extends CrudRepository<PortfolioItem, Integer> {
   List<PortfolioItem> findAllByUserId(Integer userId);

   Optional<PortfolioItem> findByUserIdAndTicker(Integer userId, String ticker);
}
