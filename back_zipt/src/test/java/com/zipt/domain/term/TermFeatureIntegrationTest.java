package com.zipt.domain.term;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.zipt.domain.term.config.TermSeedDataLoader;
import com.zipt.domain.term.dto.TermListResponse;
import com.zipt.domain.term.dto.TermResponse;
import com.zipt.domain.term.entity.RiskLevel;
import com.zipt.domain.term.entity.TermCategory;

import com.zipt.domain.term.repository.RealEstateTermRepository;
import com.zipt.domain.term.service.TermService;
import com.zipt.global.exception.ZiptException;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.test.context.TestPropertySource;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@DataJpaTest
@Import({TermSeedDataLoader.class, TermService.class, TermFeatureIntegrationTest.JacksonTestConfig.class})
@TestPropertySource(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "zipt.terms.seed-location=classpath:seed/terms.json"
})
class TermFeatureIntegrationTest {

    @Autowired
    private TermSeedDataLoader seedDataLoader;

    @Autowired
    private TermService termService;

    @Autowired
    private RealEstateTermRepository repository;

    @Test
    void loadsSeedTermsOnlyOnce() throws Exception {
        seedDataLoader.run(null);
        seedDataLoader.run(null);

        assertThat(repository.count()).isEqualTo(80);
    }

    @Test
    void fillsMissingSeedTermsWhenSomeSeedTermsAreMissing() throws Exception {
        seedDataLoader.run(null);
        repository.findByTermId("term-001").ifPresent(repository::delete);
        repository.flush();

        assertThat(repository.count()).isEqualTo(79);

        seedDataLoader.run(null);

        assertThat(repository.count()).isEqualTo(80);
        assertThat(repository.findByTermId("term-001")).isPresent();
    }

    @Test
    void searchesTermsByQueryCategoryAndRiskLevel() throws Exception {
        seedDataLoader.run(null);

        TermListResponse response = termService.search(
                "보증금",
                TermCategory.DEPOSIT_SAFETY,
                RiskLevel.NEUTRAL,
                0,
                20
        );

        assertThat(response.terms()).isNotEmpty();
        assertThat(response.totalElements()).isPositive();
        assertThat(response.terms())
                .extracting(term -> term.category().code())
                .containsOnly(TermCategory.DEPOSIT_SAFETY.name());
        assertThat(response.categories())
                .extracting(TermResponse.CategoryResponse::code)
                .contains(TermCategory.DEPOSIT_SAFETY.name());
    }

    @Test
    void findsTermById() throws Exception {
        seedDataLoader.run(null);
        String termId = repository.findAll(PageRequest.of(0, 1, Sort.by("termId")))
                .getContent()
                .getFirst()
                .getTermId();

        TermResponse response = termService.getByTermId(termId);

        assertThat(response.id()).isEqualTo(termId);
    }

    @Test
    void throwsWhenTermDoesNotExist() {
        assertThatThrownBy(() -> termService.getByTermId("missing-id"))
                .isInstanceOf(ZiptException.class);
    }

    @TestConfiguration
    static class JacksonTestConfig {
        @Bean
        ObjectMapper objectMapper() {
            return new ObjectMapper().registerModule(new JavaTimeModule());
        }
    }
}
