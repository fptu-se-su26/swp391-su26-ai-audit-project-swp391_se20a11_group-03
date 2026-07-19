package com.auction.common.controller;

import com.auction.common.dto.ApiResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Generic file upload endpoint. Files are stored under
 * <code>${app.upload.dir}</code> (default: <code>uploads/</code> in the
 * project working dir) and served back via the static resource handler
 * registered in {@link com.auction.config.WebMvcConfig}.
 */
@RestController
@RequestMapping("/api/uploads")
public class FileUploadController {

    private static final Logger log = LoggerFactory.getLogger(FileUploadController.class);

    private final Path rootLocation;

    public FileUploadController(
            @Value("${app.upload.dir:${user.dir}/uploads}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new IllegalStateException("Could not create upload directory: " + this.rootLocation, e);
        }
    }

    @PostMapping
    public ResponseEntity<ApiResponse<List<String>>> upload(@RequestParam("files") MultipartFile[] files)
            throws IOException {
        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No files provided"));
        }

        log.info("Upload request: {} file(s), sizes={}",
                files.length, java.util.Arrays.stream(files).map(f -> f.getSize()).toList());

        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }
            String original = file.getOriginalFilename() == null ? "file" : file.getOriginalFilename();
            String ext = "";
            int dot = original.lastIndexOf('.');
            if (dot > 0) {
                ext = original.substring(dot);
            }
            String stored = UUID.randomUUID().toString().replace("-", "") + ext.toLowerCase();
            Path target = rootLocation.resolve(stored);
            try {
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            } catch (IOException e) {
                log.error("Failed to write file {} to {}", stored, target, e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.error("Failed to write file: " + e.getMessage()));
            }
            urls.add("/uploads/" + stored);
        }

        if (urls.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("All uploaded files were empty"));
        }
        log.info("Upload success: {} file(s) saved", urls.size());
        return ResponseEntity.ok(ApiResponse.success("Files uploaded", urls));
    }
}
