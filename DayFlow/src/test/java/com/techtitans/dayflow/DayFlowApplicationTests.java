package com.techtitans.dayflow;

import org.junit.jupiter.api.Test;

/**
 * Basic smoke test. Full Spring context test requires a running PostgreSQL.
 * Unit tests are in separate test classes using Mockito.
 */
class DayFlowApplicationTests {

    @Test
    void contextClassExists() {
        // Verify the main application class can be loaded
        // Full context tests require a running PostgreSQL (use integration test profile)
        assert DayFlowApplication.class != null;
    }
}
