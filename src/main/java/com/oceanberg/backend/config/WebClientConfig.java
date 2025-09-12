    package com.oceanberg.backend.config;

    import org.springframework.context.annotation.Bean;
    import org.springframework.context.annotation.Configuration;
    import org.springframework.web.reactive.function.client.WebClient;

    @Configuration
    public class WebClientConfig {

        private static final int MAX_BUFFER_SIZE_MB = 2; // Increased buffer size

        @Bean
        public WebClient webClient() {
            final int sizeInBytes = MAX_BUFFER_SIZE_MB * 1024 * 1024;

            WebClient.Builder builder = WebClient.builder()
                    .codecs(configurer -> configurer
                            .defaultCodecs()
                            .maxInMemorySize(sizeInBytes));
            return builder.build();
        }
    }