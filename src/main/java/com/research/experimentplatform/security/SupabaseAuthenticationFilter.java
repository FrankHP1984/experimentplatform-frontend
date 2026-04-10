package com.research.experimentplatform.security;

import com.nimbusds.jwt.JWT;
import com.nimbusds.jwt.JWTParser;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@Component
public class SupabaseAuthenticationFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);

            try {
                // Parsear el JWT de Supabase (sin validar firma por ahora)
                JWT jwt = JWTParser.parse(token);
                Map<String, Object> claims = jwt.getJWTClaimsSet().getClaims();

                // Extraer información del usuario
                String userId = (String) claims.get("sub"); // Supabase usa 'sub' para el user ID
                String email = (String) claims.get("email");
                String role = (String) claims.get("role"); // Supabase puede tener 'role' en app_metadata

                if (userId != null && email != null) {
                    // Crear autenticación
                    UsernamePasswordAuthenticationToken authentication =
                            new UsernamePasswordAuthenticationToken(
                                    email,
                                    null,
                                    role != null ? List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())) : List.of()
                            );

                    // Guardar userId en los detalles para usarlo en los controllers
                    authentication.setDetails(userId);

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                // Si el token no es válido, simplemente no autenticamos
                logger.warn("Invalid Supabase token: " + e.getMessage());
            }
        }

        filterChain.doFilter(request, response);
    }
}
