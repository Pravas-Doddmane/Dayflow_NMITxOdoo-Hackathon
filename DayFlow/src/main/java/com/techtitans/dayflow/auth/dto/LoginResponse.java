package com.techtitans.dayflow.auth.dto;

public record LoginResponse(
        String token,
        String tokenType,
        long expiresIn,
        Long userId,
        Long employeeId,
        String role,
        String email,
        Long companyId,
        String companyName
) {
    public static LoginResponse of(String token, long expiresIn, Long userId, Long employeeId, String role, String email, Long companyId, String companyName) {
        return new LoginResponse(token, "Bearer", expiresIn, userId, employeeId, role, email, companyId, companyName);
    }
}
