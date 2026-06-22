package com.auction.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Paths;

/**
 * Serves uploaded files (e.g. product images) from the upload directory.
 * <p>
 * URL: <code>/uploads/{filename}</code> &rarr; <code>${app.upload.dir}/{filename}</code>
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:${user.dir}/uploads}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String absolute = toResourceLocation(uploadDir);
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(absolute);
    }

    private String toResourceLocation(String path) {
        String absolute = Paths.get(path).toAbsolutePath().normalize().toUri().toString();
        // ResourceHandler expects the location ending with a trailing slash
        if (!absolute.endsWith("/")) {
            absolute = absolute + "/";
        }
        return absolute;
    }
}
