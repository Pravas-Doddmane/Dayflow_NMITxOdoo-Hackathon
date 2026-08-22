package com.techtitans.dayflow.document.service;

import com.techtitans.dayflow.common.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Local filesystem implementation of StorageService.
 * Replace with S3 or other implementation when ready.
 */
@Slf4j
@Service
public class LocalStorageService implements StorageService {

    @Value("${app.storage.upload-dir:./uploads}")
    private String uploadDir;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    @Override
    public String store(MultipartFile file, String subdirectory) {
        if (file.isEmpty()) {
            throw new BadRequestException("Cannot store an empty file");
        }

        try {
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String uniqueFilename = UUID.randomUUID() + extension;

            Path targetDirectory = Paths.get(uploadDir, subdirectory).toAbsolutePath().normalize();
            Files.createDirectories(targetDirectory);

            Path targetPath = targetDirectory.resolve(uniqueFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String relativePath = "uploads/" + subdirectory + "/" + uniqueFilename;
            log.info("Stored file: {}", relativePath);
            return baseUrl + "/" + relativePath;

        } catch (IOException e) {
            log.error("Failed to store file: {}", e.getMessage());
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public void delete(String fileUrl) {
        try {
            if (fileUrl != null) {
                String relativePath = fileUrl;
                if (fileUrl.startsWith("http")) {
                    int uploadsIndex = fileUrl.indexOf("uploads/");
                    if (uploadsIndex != -1) {
                        relativePath = fileUrl.substring(uploadsIndex);
                    }
                }
                Path filePath = Paths.get(uploadDir).resolve(relativePath.replace("uploads/", "")).toAbsolutePath().normalize();
                Files.deleteIfExists(filePath);
                log.info("Deleted file: {}", filePath);
            }
        } catch (IOException e) {
            log.warn("Could not delete file: {}", e.getMessage());
        }
    }

    @Override
    public org.springframework.core.io.Resource loadAsResource(String fileUrl) {
        try {
            String relativePath = fileUrl;
            if (fileUrl != null && fileUrl.startsWith("http")) {
                int uploadsIndex = fileUrl.indexOf("uploads/");
                if (uploadsIndex != -1) {
                    relativePath = fileUrl.substring(uploadsIndex);
                }
            }
            if (relativePath == null) {
                throw new com.techtitans.dayflow.common.exception.ResourceNotFoundException("File URL is null");
            }

            Path filePath = Paths.get(uploadDir).resolve(relativePath.replace("uploads/", "")).toAbsolutePath().normalize();
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }

            // Fallback: try direct path relative to project root
            Path directPath = Paths.get(relativePath).toAbsolutePath().normalize();
            resource = new org.springframework.core.io.UrlResource(directPath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }

            throw new com.techtitans.dayflow.common.exception.ResourceNotFoundException("File not found on storage: " + fileUrl);
        } catch (Exception e) {
            log.error("Error loading file resource: {}", e.getMessage());
            throw new com.techtitans.dayflow.common.exception.ResourceNotFoundException("Could not read file: " + fileUrl);
        }
    }
}
