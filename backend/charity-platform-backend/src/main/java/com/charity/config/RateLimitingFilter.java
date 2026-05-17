package com.charity.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    /** Max login attempts per IP per endpoint per minute */
    static final int LOGIN_RATE_LIMIT = 5;
    /** Max public POST requests per IP per minute */
    static final int PUBLIC_POST_RATE_LIMIT = 10;

    // Separate buckets per IP per endpoint group
    private final Map<String, Bucket> loginBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> publicPostBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {

        String path = request.getRequestURI();
        String method = request.getMethod();
        String ip = resolveClientIp(request);

        if ("POST".equalsIgnoreCase(method)) {
            if (path.endsWith("/auth/login") || path.endsWith("/admin/auth/login")) {
                Bucket bucket = loginBuckets.computeIfAbsent(ip + ":" + path, k -> buildLoginBucket());
                if (!bucket.tryConsume(1)) {
                    rejectTooManyRequests(response, 60);
                    return;
                }
            } else if (path.endsWith("/volunteers") || path.endsWith("/donations")) {
                Bucket bucket = publicPostBuckets.computeIfAbsent(ip, k -> buildPublicPostBucket());
                if (!bucket.tryConsume(1)) {
                    rejectTooManyRequests(response, 60);
                    return;
                }
            }
        }

        chain.doFilter(request, response);
    }

    /** LOGIN_RATE_LIMIT attempts per minute per IP per endpoint */
    private Bucket buildLoginBucket() {
        Bandwidth limit = Bandwidth.classic(LOGIN_RATE_LIMIT, Refill.intervally(LOGIN_RATE_LIMIT, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    /** PUBLIC_POST_RATE_LIMIT requests per minute per IP */
    private Bucket buildPublicPostBucket() {
        Bandwidth limit = Bandwidth.classic(PUBLIC_POST_RATE_LIMIT, Refill.intervally(PUBLIC_POST_RATE_LIMIT, Duration.ofMinutes(1)));
        return Bucket.builder().addLimit(limit).build();
    }

    private void rejectTooManyRequests(HttpServletResponse response, int retryAfterSeconds)
            throws IOException {
        response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setHeader("Retry-After", String.valueOf(retryAfterSeconds));
        response.getWriter().write(
            "{\"error\":\"Too Many Requests\",\"retryAfter\":" + retryAfterSeconds + "}"
        );
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
