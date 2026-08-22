package com.techtitans.dayflow.leave.dto;

import com.fasterxml.jackson.annotation.JsonAlias;

public record LeaveReviewRequest(
        @JsonAlias({"adminComment", "comment", "remarks", "reviewerComment"})
        String comment
) {}
