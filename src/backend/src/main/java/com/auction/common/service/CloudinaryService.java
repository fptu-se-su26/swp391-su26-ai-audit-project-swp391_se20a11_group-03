package com.auction.common.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import java.util.UUID;

/**
 * Thin wrapper around the Cloudinary SDK. Uploads image bytes to Cloudinary and
 * returns the delivered secure URL, which callers persist in the database in
 * place of the old local {@code /uploads/...} paths.
 */
@Service
public class CloudinaryService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryService.class);

    private final Cloudinary cloudinary;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public CloudinaryService(Cloudinary cloudinary) {
        this.cloudinary = cloudinary;
    }

    /**
     * Upload a multipart file to the given folder and return its secure URL.
     */
    public String upload(MultipartFile file, String folder) throws IOException {
        return upload(file.getBytes(), folder);
    }

    /**
     * Upload raw image bytes to the given folder and return the secure URL.
     */
    @SuppressWarnings("unchecked")
    public String upload(byte[] bytes, String folder) throws IOException {
        Map<String, Object> options = ObjectUtils.asMap(
                "folder", folder,
                "public_id", UUID.randomUUID().toString().replace("-", ""),
                "resource_type", "image",
                "overwrite", true
        );
        Map<String, Object> result = cloudinary.uploader().upload(bytes, options);
        Object secureUrl = result.get("secure_url");
        if (secureUrl == null) {
            secureUrl = result.get("url");
        }
        if (secureUrl == null) {
            throw new IOException("Cloudinary upload returned no URL");
        }
        log.info("Uploaded image to Cloudinary: {}", secureUrl);
        return secureUrl.toString();
    }

    /**
     * Upload private (authenticated) image bytes — the delivered asset cannot be
     * viewed without a signed URL. Used for sensitive KYC documents. Returns the
     * Cloudinary {@code public_id}, which the caller persists (not a public URL).
     */
    @SuppressWarnings("unchecked")
    public String uploadPrivate(byte[] bytes, String folder) throws IOException {
        Map<String, Object> options = ObjectUtils.asMap(
                "folder", folder,
                "public_id", UUID.randomUUID().toString().replace("-", ""),
                "resource_type", "image",
                "type", "authenticated",
                "overwrite", true
        );
        Map<String, Object> result = cloudinary.uploader().upload(bytes, options);
        Object publicId = result.get("public_id");
        if (publicId == null) {
            throw new IOException("Cloudinary upload returned no public_id");
        }
        return publicId.toString();
    }

    /**
     * Generate a signed, authenticated delivery URL for a private asset.
     */
    public String signedUrl(String publicId) {
        return cloudinary.url()
                .secure(true)
                .resourceType("image")
                .type("authenticated")
                .signed(true)
                .generate(publicId);
    }

    /**
     * Download the bytes of a private KYC asset by its {@code public_id}, using a
     * short-lived signed URL. Only the backend (which holds the API secret) can
     * mint these, so access stays gated behind our own authorization checks.
     */
    public byte[] downloadPrivate(String publicId) throws IOException {
        return download(signedUrl(publicId));
    }

    /**
     * Download the bytes of a remote (Cloudinary) image URL. Used by the KYC
     * forensic scan, which needs the raw image to analyse.
     */
    public byte[] download(String url) throws IOException {
        try {
            HttpRequest request = HttpRequest.newBuilder(URI.create(url)).GET().build();
            HttpResponse<byte[]> response = httpClient.send(request, HttpResponse.BodyHandlers.ofByteArray());
            if (response.statusCode() / 100 != 2) {
                throw new IOException("Failed to download image, HTTP " + response.statusCode() + ": " + url);
            }
            return response.body();
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IOException("Interrupted while downloading image: " + url, e);
        }
    }
}
