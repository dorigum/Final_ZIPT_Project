package com.zipt.domain.contract.repository;

import com.zipt.domain.contract.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

	List<Contract> findByMemberId(Long memberId);

	Optional<Contract> findByIdAndMemberId(Long id, Long memberId);
}
