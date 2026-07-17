package com.zipt.domain.term.controller;

import com.zipt.domain.term.dto.TermListResponse;
import com.zipt.domain.term.dto.TermResponse;
import com.zipt.domain.term.entity.RiskLevel;
import com.zipt.domain.term.entity.TermCategory;
import com.zipt.domain.term.service.TermService;
import com.zipt.global.exception.GlobalExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.setup.MockMvcBuilders.standaloneSetup;

class TermControllerTest {

    private TermService termService;
    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        termService = mock(TermService.class);
        mockMvc = standaloneSetup(new TermController(termService, "seed/terms.json", "test-admin-token"))
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    void searchesTerms() throws Exception {
        TermListResponse response = new TermListResponse(
                LocalDate.of(2026, 6, 24),
                1,
                List.of(TermResponse.CategoryResponse.from(TermCategory.DEPOSIT_SAFETY)),
                List.of(termResponse("term-001", "보증금")),
                0,
                20,
                1,
                1
        );
        when(termService.search(
                eq("보증금"),
                eq(TermCategory.DEPOSIT_SAFETY),
                eq(RiskLevel.NEUTRAL),
                eq(0),
                eq(20)
        )).thenReturn(response);

        mockMvc.perform(get("/api/terms")
                        .param("q", "보증금")
                        .param("category", "DEPOSIT_SAFETY")
                        .param("risk", "neutral"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.count").value(1))
                .andExpect(jsonPath("$.data.categories[0].code").value("DEPOSIT_SAFETY"))
                .andExpect(jsonPath("$.data.categories[0].label").value(TermCategory.DEPOSIT_SAFETY.label()))
                .andExpect(jsonPath("$.data.terms[0].id").value("term-001"))
                .andExpect(jsonPath("$.data.terms[0].category.code").value("DEPOSIT_SAFETY"));
    }

    @Test
    void getsTermById() throws Exception {
        when(termService.getByTermId("term-001")).thenReturn(termResponse("term-001", "보증금"));

        mockMvc.perform(get("/api/terms/{id}", "term-001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value("term-001"))
                .andExpect(jsonPath("$.data.term").value("보증금"));
    }

    @Test
    void returnsBadRequestWhenFilterIsInvalid() throws Exception {
        mockMvc.perform(get("/api/terms").param("category", "UNKNOWN"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    void returnsBadRequestWhenPageRequestIsInvalid() throws Exception {
        mockMvc.perform(get("/api/terms").param("page", "-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    private TermResponse termResponse(String id, String term) {
        return new TermResponse(
                id,
                term,
                List.of(),
                TermResponse.CategoryResponse.from(TermCategory.DEPOSIT_SAFETY),
                new TermResponse.OfficialDefinition("definition", "source", null, null, null),
                new TermResponse.ZiptDefinition("easy", null, "neutral"),
                true
        );
    }
}
