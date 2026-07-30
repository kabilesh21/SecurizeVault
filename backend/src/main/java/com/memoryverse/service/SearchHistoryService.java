package com.memoryverse.service;

import com.memoryverse.dto.SearchHistoryResponse;
import com.memoryverse.entity.SearchHistory;
import com.memoryverse.entity.User;
import com.memoryverse.exception.ResourceNotFoundException;
import com.memoryverse.repository.SearchHistoryRepository;
import com.memoryverse.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class SearchHistoryService {

    @Autowired
    private SearchHistoryRepository searchHistoryRepository;

    @Autowired
    private UserRepository userRepository;

    public List<SearchHistoryResponse> getHistory(Long userId) {
        return searchHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(sh -> SearchHistoryResponse.builder()
                        .id(sh.getId())
                        .query(sh.getQuery())
                        .detectedIntent(sh.getDetectedIntent())
                        .resultCount(sh.getResultCount())
                        .searchedAt(sh.getCreatedAt().toString())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void addHistoryEntry(Long userId, String query, String intent, int resultCount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        SearchHistory history = SearchHistory.builder()
                .user(user)
                .query(query)
                .detectedIntent(intent)
                .resultCount(resultCount)
                .build();
        
        searchHistoryRepository.save(history);
    }

    @Transactional
    public void deleteHistoryEntry(Long userId, Long historyId) {
        searchHistoryRepository.deleteByIdAndUserId(historyId, userId);
    }

    @Transactional
    public void clearHistory(Long userId) {
        searchHistoryRepository.deleteByUserId(userId);
    }
}
