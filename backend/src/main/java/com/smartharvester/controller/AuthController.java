package com.smartharvester.controller;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final JwtEncoder jwtEncoder;
    private final long ttlMinutes;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtEncoder jwtEncoder,
            @Value("${app.security.token-ttl-minutes}") long ttlMinutes) {
        this.authenticationManager = authenticationManager;
        this.jwtEncoder = jwtEncoder;
        this.ttlMinutes = ttlMinutes;
    }

    @PostMapping("/token")
    public Map<String, Object> token(@Valid @RequestBody LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.username(), request.password()));
        Instant issuedAt = Instant.now();
        Instant expiresAt = issuedAt.plus(ttlMinutes, ChronoUnit.MINUTES);
        List<String> roles = authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority().replaceFirst("^ROLE_", ""))
                .toList();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer("smart-harvester")
                .issuedAt(issuedAt)
                .expiresAt(expiresAt)
                .subject(authentication.getName())
                .claim("roles", roles)
                .build();
        JwsHeader headers = JwsHeader.with(MacAlgorithm.HS256).build();
        return Map.of(
                "accessToken", jwtEncoder.encode(JwtEncoderParameters.from(headers, claims)).getTokenValue(),
                "tokenType", "Bearer",
                "expiresAt", expiresAt.toString(),
                "roles", roles
        );
    }

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {
    }
}
