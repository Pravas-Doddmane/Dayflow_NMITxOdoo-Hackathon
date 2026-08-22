package com.techtitans.dayflow.notification;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Builds HTML email content for various DayFlow events.
 * All email content is centralized here — not scattered across services.
 */
@Service
public class EmailTemplateService {

    @Value("${app.base-url:http://localhost:5173}")
    private String baseUrl;

    /**
     * Employee invitation / password setup email.
     */
    public String buildPasswordSetupEmail(String firstName, String token) {
        String setupUrl = baseUrl + "/setup-password?token=" + token;
        return buildHtmlTemplate(
                "Welcome to DayFlow HRMS!",
                "Hi " + firstName + ",",
                "Your employee account has been created. Please click the button below to set up your password and activate your account.",
                "Set Up Password",
                setupUrl,
                "This link is valid for 48 hours and can only be used once.",
                "If you did not expect this email, please ignore it or contact your HR department."
        );
    }

    /**
     * Email verification email.
     */
    public String buildEmailVerificationEmail(String firstName, String token) {
        String verifyUrl = baseUrl + "/verify-email?token=" + token;
        return buildHtmlTemplate(
                "Verify Your Email — DayFlow HRMS",
                "Hi " + firstName + ",",
                "Please verify your email address to complete your account setup.",
                "Verify Email",
                verifyUrl,
                "This link is valid for 24 hours.",
                "If you did not create an account, please ignore this email."
        );
    }

    /**
     * Admin registration verification email with company details.
     */
    public String buildAdminRegistrationVerificationEmail(String companyName, String firstName, String token) {
        String verifyUrl = baseUrl + "/verify-email?token=" + token;
        return buildHtmlTemplate(
                "Welcome to DayFlow — Verify Your Admin Account",
                "Hi " + (firstName != null && !firstName.isBlank() ? firstName : "Admin") + ",",
                "Thank you for registering <strong>" + escapeHtml(companyName) + "</strong> with DayFlow HRMS. Please verify your email to activate your company's administration workspace.",
                "Verify & Activate Account",
                verifyUrl,
                "This verification link is valid for 24 hours.",
                "If you did not initiate this company registration, please disregard this email."
        );
    }

    /**
     * Password reset email.
     */
    public String buildPasswordResetEmail(String firstName, String token) {
        String resetUrl = baseUrl + "/reset-password?token=" + token;
        return buildHtmlTemplate(
                "Password Reset Request — DayFlow HRMS",
                "Hi " + firstName + ",",
                "We received a request to reset your DayFlow HRMS password.",
                "Reset Password",
                resetUrl,
                "This link is valid for 1 hour and can only be used once.",
                "If you did not request a password reset, please ignore this email. Your password will remain unchanged."
        );
    }

    /**
     * Leave approved email.
     */
    public String buildLeaveApprovedEmail(String firstName, String leaveType, String startDate, String endDate, String comment) {
        String commentSection = (comment != null && !comment.isBlank())
                ? "<p style='color:#555;'><strong>Admin comment:</strong> " + escapeHtml(comment) + "</p>"
                : "";
        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
                  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="background: #4CAF50; padding: 30px; text-align: center;">
                      <h1 style="color: #fff; margin: 0; font-size: 24px;">Leave Approved ✓</h1>
                    </div>
                    <div style="padding: 30px;">
                      <p>Hi %s,</p>
                      <p>Your <strong>%s leave</strong> request from <strong>%s</strong> to <strong>%s</strong> has been <strong style="color:#4CAF50;">approved</strong>.</p>
                      %s
                      <p>Please coordinate with your team accordingly.</p>
                    </div>
                    <div style="background: #f4f6f9; padding: 15px; text-align: center; color: #999; font-size: 12px;">
                      DayFlow HRMS — Human Resource Management System
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(escapeHtml(firstName), escapeHtml(leaveType), startDate, endDate, commentSection);
    }

    /**
     * Leave rejected email.
     */
    public String buildLeaveRejectedEmail(String firstName, String leaveType, String startDate, String endDate, String comment) {
        String commentSection = (comment != null && !comment.isBlank())
                ? "<p style='color:#555;'><strong>Reason:</strong> " + escapeHtml(comment) + "</p>"
                : "";
        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
                  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="background: #e53935; padding: 30px; text-align: center;">
                      <h1 style="color: #fff; margin: 0; font-size: 24px;">Leave Request Update</h1>
                    </div>
                    <div style="padding: 30px;">
                      <p>Hi %s,</p>
                      <p>Your <strong>%s leave</strong> request from <strong>%s</strong> to <strong>%s</strong> has been <strong style="color:#e53935;">rejected</strong>.</p>
                      %s
                      <p>If you have questions, please contact your HR administrator.</p>
                    </div>
                    <div style="background: #f4f6f9; padding: 15px; text-align: center; color: #999; font-size: 12px;">
                      DayFlow HRMS — Human Resource Management System
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(escapeHtml(firstName), escapeHtml(leaveType), startDate, endDate, commentSection);
    }

    // ==========================================
    // Private helpers
    // ==========================================

    private String buildHtmlTemplate(String title, String greeting, String body,
                                     String buttonText, String buttonUrl,
                                     String note, String footer) {
        return """
                <!DOCTYPE html>
                <html>
                <head><meta charset="UTF-8"></head>
                <body style="font-family: Arial, sans-serif; background-color: #f4f6f9; padding: 20px;">
                  <div style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
                    <div style="background: linear-gradient(135deg, #1a73e8, #0d47a1); padding: 30px; text-align: center;">
                      <h1 style="color: #fff; margin: 0; font-size: 24px;">DayFlow HRMS</h1>
                    </div>
                    <div style="padding: 30px;">
                      <h2 style="color: #333;">%s</h2>
                      <p>%s</p>
                      <p style="color: #555;">%s</p>
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="%s"
                           style="background: #1a73e8; color: #fff; padding: 14px 28px; border-radius: 6px;
                                  text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block;">
                          %s
                        </a>
                      </div>
                      <p style="color: #888; font-size: 13px;"><em>%s</em></p>
                      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                      <p style="color: #999; font-size: 12px;">%s</p>
                    </div>
                    <div style="background: #f4f6f9; padding: 15px; text-align: center; color: #999; font-size: 12px;">
                      DayFlow HRMS — Human Resource Management System
                    </div>
                  </div>
                </body>
                </html>
                """.formatted(title, greeting, body, buttonUrl, buttonText, note, footer);
    }

    private String escapeHtml(String text) {
        if (text == null) return "";
        return text.replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;");
    }
}
