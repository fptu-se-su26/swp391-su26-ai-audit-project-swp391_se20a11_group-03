package com.auction.account.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Collection;
import java.util.UUID;

/** Private, filesystem-backed storage for identity documents. */
@Component
public class KycDocumentStorage {

    private final Path root;
    private final Path legacyRoot;

    public KycDocumentStorage(
            @Value("${app.kyc.upload-dir:${user.dir}/data/private/kyc}") String uploadDir,
            @Value("${app.kyc.legacy-upload-dir:${user.dir}/src/main/resources/static/uploads/kyc}") String legacyUploadDir)
            throws IOException {
        this.root = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.legacyRoot = Paths.get(legacyUploadDir).toAbsolutePath().normalize();
        Files.createDirectories(root);
    }

    public String store(byte[] bytes, String label, String extension) throws IOException {
        String fileName = "kyc-" + label + "-" + UUID.randomUUID() + extension;
        Path destination = safeResolve(fileName);
        Path temporary = Files.createTempFile(root, ".kyc-", ".tmp");
        try {
            Files.write(temporary, bytes);
            Files.move(temporary, destination, StandardCopyOption.ATOMIC_MOVE);
        } catch (IOException ex) {
            Files.deleteIfExists(temporary);
            throw ex;
        }
        return fileName;
    }

    public Resource load(String storedReference) throws IOException {
        Path file = findExisting(storedReference);
        if (!Files.isRegularFile(file)) {
            throw new IOException("KYC document not found");
        }
        return new UrlResource(file.toUri());
    }

    public byte[] read(String storedReference, long maxBytes) throws IOException {
        Path file = findExisting(storedReference);
        if (!Files.isRegularFile(file) || Files.size(file) > maxBytes) {
            throw new IOException("KYC document is missing or exceeds the configured limit");
        }
        return Files.readAllBytes(file);
    }

    public void deleteAll(Collection<String> storedReferences) {
        if (storedReferences == null) return;
        storedReferences.stream().filter(value -> value != null && !value.isBlank()).forEach(value -> {
            try {
                Files.deleteIfExists(findExisting(value));
            } catch (IOException ignored) {
                // Cleanup must never hide the database result; an ops sweep can remove orphan files.
            }
        });
    }

    private Path safeResolve(String fileName) throws IOException {
        Path resolved = root.resolve(fileName).normalize();
        if (!resolved.getParent().equals(root)) {
            throw new IOException("Invalid KYC document path");
        }
        return resolved;
    }

    private Path findExisting(String reference) throws IOException {
        String fileName = extractFileName(reference);
        Path current = safeResolve(fileName);
        if (Files.isRegularFile(current)) return current;
        Path legacy = legacyRoot.resolve(fileName).normalize();
        if (!legacy.getParent().equals(legacyRoot)) throw new IOException("Invalid legacy KYC document path");
        return legacy;
    }

    private String extractFileName(String reference) {
        String normalized = reference == null ? "" : reference.replace('\\', '/');
        return normalized.substring(normalized.lastIndexOf('/') + 1);
    }
}
