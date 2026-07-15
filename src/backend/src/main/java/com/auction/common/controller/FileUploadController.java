package com.auction.common.controller;

import com.auction.common.dto.ApiResponse;
import com.auction.common.service.CloudinaryService;
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
import java.util.ArrayList;
import java.util.List;

/**
 * Generic image upload endpoint. Files are stored on Cloudinary and the
 * returned secure URLs are what callers persist in the database.
 */
@RestController
@RequestMapping("/api/uploads")
public class FileUploadController {

    private static final Logger log = LoggerFactory.getLogger(FileUploadController.class);

    private final CloudinaryService cloudinaryService;
    private final String folder;

    public FileUploadController(
            CloudinaryService cloudinaryService,
            @Value("${cloudinary.folder.products:auction/products}") String folder) {
        this.cloudinaryService = cloudinaryService;
        this.folder = folder;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<List<String>>> upload(@RequestParam("files") MultipartFile[] files) {
        if (files == null || files.length == 0) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("No files provided"));
        }

        log.info("Upload request: {} file(s), sizes={}",
                files.length, java.util.Arrays.stream(files).map(MultipartFile::getSize).toList());

        List<String> urls = new ArrayList<>();
        for (MultipartFile file : files) {
            if (file.isEmpty()) {
                continue;
            }
            try {
                urls.add(cloudinaryService.upload(file, folder));
            } catch (IOException e) {
                log.error("Failed to upload file to Cloudinary", e);
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body(ApiResponse.error("Failed to upload file: " + e.getMessage()));
            }
        }

        if (urls.isEmpty()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error("All uploaded files were empty"));
        }
        log.info("Upload success: {} file(s) saved", urls.size());
        return ResponseEntity.ok(ApiResponse.success("Files uploaded", urls));
    }
}
