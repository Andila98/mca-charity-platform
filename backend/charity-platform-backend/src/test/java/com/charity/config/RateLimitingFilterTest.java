package com.charity.config;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

import static org.assertj.core.api.Assertions.assertThat;

class RateLimitingFilterTest {

    private RateLimitingFilter filter;

    @BeforeEach
    void setUp() {
        filter = new RateLimitingFilter();
    }

    @Test
    void loginEndpoint_withinLimit_passes() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        request.setRemoteAddr("10.0.0.1");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(HttpStatus.OK.value());
    }

    @Test
    void loginEndpoint_exceedingLimit_returns429() throws Exception {
        String ip = "10.0.0.2";

        // Exhaust the login bucket
        for (int i = 0; i < RateLimitingFilter.LOGIN_RATE_LIMIT; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            req.setRemoteAddr(ip);
            filter.doFilterInternal(req, new MockHttpServletResponse(), new MockFilterChain());
        }

        // Next request should be rate-limited
        MockHttpServletRequest reqOver = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        reqOver.setRemoteAddr(ip);
        MockHttpServletResponse responseOver = new MockHttpServletResponse();
        filter.doFilterInternal(reqOver, responseOver, new MockFilterChain());

        assertThat(responseOver.getStatus()).isEqualTo(429);
        assertThat(responseOver.getHeader("Retry-After")).isNotNull();
    }

    @Test
    void publicPostEndpoint_withinLimit_passes() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/v1/donations");
        request.setRemoteAddr("10.0.0.3");
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain chain = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        assertThat(response.getStatus()).isEqualTo(HttpStatus.OK.value());
    }

    @Test
    void publicPostEndpoint_exceedingLimit_returns429() throws Exception {
        String ip = "10.0.0.7";

        for (int i = 0; i < RateLimitingFilter.PUBLIC_POST_RATE_LIMIT; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/donations");
            req.setRemoteAddr(ip);
            filter.doFilterInternal(req, new MockHttpServletResponse(), new MockFilterChain());
        }

        MockHttpServletRequest reqOver = new MockHttpServletRequest("POST", "/api/v1/donations");
        reqOver.setRemoteAddr(ip);
        MockHttpServletResponse responseOver = new MockHttpServletResponse();
        filter.doFilterInternal(reqOver, responseOver, new MockFilterChain());

        assertThat(responseOver.getStatus()).isEqualTo(429);
        assertThat(responseOver.getHeader("Retry-After")).isNotNull();
    }

    @Test
    void getRequest_neverRateLimited() throws Exception {
        String ip = "10.0.0.4";

        // GET requests should never be rate limited regardless of count
        for (int i = 0; i < 20; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("GET", "/api/v1/projects");
            req.setRemoteAddr(ip);
            MockHttpServletResponse resp = new MockHttpServletResponse();
            filter.doFilterInternal(req, resp, new MockFilterChain());
            assertThat(resp.getStatus()).isEqualTo(HttpStatus.OK.value());
        }
    }

    @Test
    void differentIPs_haveIndependentBuckets() throws Exception {
        // Exhaust IP A
        for (int i = 0; i < RateLimitingFilter.LOGIN_RATE_LIMIT; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            req.setRemoteAddr("10.0.0.5");
            filter.doFilterInternal(req, new MockHttpServletResponse(), new MockFilterChain());
        }

        // IP B should still pass
        MockHttpServletRequest reqB = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        reqB.setRemoteAddr("10.0.0.6");
        MockHttpServletResponse respB = new MockHttpServletResponse();
        filter.doFilterInternal(reqB, respB, new MockFilterChain());

        assertThat(respB.getStatus()).isEqualTo(HttpStatus.OK.value());
    }

    @Test
    void xForwardedForHeader_usedAsClientIp() throws Exception {
        String realIp = "203.0.113.10";
        String proxyIp = "10.0.0.8";

        // Exhaust the bucket for the real IP behind X-Forwarded-For
        for (int i = 0; i < RateLimitingFilter.LOGIN_RATE_LIMIT; i++) {
            MockHttpServletRequest req = new MockHttpServletRequest("POST", "/api/v1/auth/login");
            req.setRemoteAddr(proxyIp);
            req.addHeader("X-Forwarded-For", realIp + ", 10.0.0.1");
            filter.doFilterInternal(req, new MockHttpServletResponse(), new MockFilterChain());
        }

        MockHttpServletRequest reqOver = new MockHttpServletRequest("POST", "/api/v1/auth/login");
        reqOver.setRemoteAddr(proxyIp);
        reqOver.addHeader("X-Forwarded-For", realIp + ", 10.0.0.1");
        MockHttpServletResponse responseOver = new MockHttpServletResponse();
        filter.doFilterInternal(reqOver, responseOver, new MockFilterChain());

        assertThat(responseOver.getStatus()).isEqualTo(429);
    }
}
