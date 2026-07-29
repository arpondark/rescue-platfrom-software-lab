package com.shazan.Nexora.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Provides a Jackson 2 {@link ObjectMapper} bean for services that need it
 * (e.g. BulkUploadService for serializing error reports).
 *
 * Spring Boot 4.1's default Jackson auto-configuration exposes
 * {@code tools.jackson.databind.json.JsonMapper} (Jackson 3), not the
 * Jackson 2 {@code com.fasterxml.jackson.databind.ObjectMapper}.
 * This config publishes a Jackson 2 mapper that coexists with the default.
 *
 * The bean is only registered if no other {@code ObjectMapper} bean already
 * exists, so it won't override a user-defined mapper.
 */
@Configuration
public class JacksonConfig {

    @Bean
    @ConditionalOnMissingBean(ObjectMapper.class)
    public ObjectMapper objectMapper() {
        ObjectMapper mapper = new ObjectMapper();
        mapper.registerModule(new JavaTimeModule());
        mapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
        return mapper;
    }
}