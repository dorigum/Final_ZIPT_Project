package com.zipt.domain.contract.service;

import com.zipt.domain.contract.entity.ContractProcessingStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

@Service
public class ContractProcessingNotifier {
    private final ConcurrentHashMap<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public SseEmitter subscribe(Long contractId, ContractProcessingStatus status, String errorMessage) {
        SseEmitter emitter = new SseEmitter(0L);
        emitters.computeIfAbsent(contractId, ignored -> new CopyOnWriteArrayList<>()).add(emitter);
        emitter.onCompletion(() -> remove(contractId, emitter));
        emitter.onTimeout(() -> remove(contractId, emitter));
        emitter.onError(error -> remove(contractId, emitter));
        send(contractId, emitter, status, errorMessage);
        return emitter;
    }

    public void publish(Long contractId, ContractProcessingStatus status, String errorMessage) {
        for (SseEmitter emitter : emitters.getOrDefault(contractId, List.of())) {
            send(contractId, emitter, status, errorMessage);
        }
    }

    private void send(Long contractId, SseEmitter emitter, ContractProcessingStatus status, String errorMessage) {
        try {
            emitter.send(SseEmitter.event().name("processing-status").data(Map.of(
                    "contractId", contractId,
                    "status", status.name(),
                    "errorMessage", errorMessage == null ? "" : errorMessage,
                    "updatedAt", Instant.now().toString()
            )));
        } catch (Exception e) {
            remove(contractId, emitter);
            try {
                emitter.complete();
            } catch (Exception ignored) {}
        }
    }

    private void remove(Long contractId, SseEmitter emitter) {
        emitters.computeIfPresent(contractId, (key, subscribers) -> {
            subscribers.remove(emitter);
            return subscribers.isEmpty() ? null : subscribers;
        });
    }
}
