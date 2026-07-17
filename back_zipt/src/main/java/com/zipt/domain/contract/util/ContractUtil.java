package com.zipt.domain.contract.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.zipt.domain.contract.dto.ContractVisionExtractionResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class ContractUtil {
	private final ObjectMapper objectMapper;

	public String defaultText(String value, String defaultValue) {
		if (value == null || value.isBlank()) {
			return defaultValue;
		}

		return value.trim();
	}

	public <E extends Enum<E>> E parseEnum(
			Class<E> enumClass,
			String value,
			E defaultValue
	) {
		if (value == null || value.isBlank()) {
			return defaultValue;
		}

		try {
			return Enum.valueOf(enumClass, value.trim());
		} catch (IllegalArgumentException e) {
			return defaultValue;
		}
	}

	public String toJson(Object value) {
		if (value == null) {
			return "[]";
		}

		try {
			return objectMapper.writeValueAsString(value);
		} catch (JsonProcessingException e) {
			return "[]";
		}
	}

	public String toCheckboxJson(ContractVisionExtractionResponse response) {
		if (response == null) {
			return "{}";
		}

		return toJson(response);
	}
}
