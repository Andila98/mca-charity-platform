package com.mcacampaignplatform.volunteerservices.event;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Event published when a volunteer registers
 * This event is sent to Kafka topic: "volunteer-events"
 * Other services (Messaging Service, Analytics Service) will subscribe to this
 */

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VolunteerRegisteredEvent {

    @JsonProperty("volunteer_id")
    private Long volunteerId;

    @JsonProperty("name")
    private String name;

    @JsonProperty("phone")
    private String phone;

    @JsonProperty("email")
    private String email;

    @JsonProperty("ward")
    private String ward;

    @JsonProperty("interest")
    private String interest;

    @JsonProperty("timestamp")
    private long timestamp;

    @JsonProperty("event_type")
    private String eventType = "VOLUNTEER_REGISTERED";
}
