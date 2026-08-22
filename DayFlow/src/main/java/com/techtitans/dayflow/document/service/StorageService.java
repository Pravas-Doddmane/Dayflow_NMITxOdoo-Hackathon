package com.techtitans.dayflow.document.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Abstraction for file storage.
 * Switch implementation to S3/Cloudinary without changing DocumentService.
 */
public interface StorageService {

    /**
     * Store a file and return its URL/path.
     */
    String store(MultipartFile file, String subdirectory);

    /**
     * Delete a file by its URL/path.
     */
    void delete(String fileUrl);
}
