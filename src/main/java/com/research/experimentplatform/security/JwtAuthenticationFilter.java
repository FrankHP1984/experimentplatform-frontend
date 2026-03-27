package com.research.experimentplatform.security;

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
import java.util.Collections;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        // Extraemos el header Authorization de la petición HTTP
        // El token JWT viene en formato: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        String authHeader = request.getHeader("Authorization");

        // Si no hay header o no empieza por "Bearer ", no hay token
        // Dejamos pasar la petición sin autenticar (luego Spring Security la rechazará si hace falta)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // Quitamos el "Bearer " del principio para quedarnos solo con el token
        // substring(7) porque "Bearer " tiene 7 caracteres
        String token = authHeader.substring(7);
        
        // Extraemos el email del token (viene en los claims del JWT)
        String email = jwtUtil.extractEmail(token);

        // Si hay email y no hay autenticación previa, validamos el token
        if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            // Validamos que el token sea correcto y no haya caducado
            if (jwtUtil.validateToken(token, email)) {
                // Extraemos el userId del token (lo añadimos nosotros en el login)
                Long userId = jwtUtil.extractUserId(token);
                
                // Creamos el objeto de autenticación de Spring Security
                // Le pasamos el email como principal y una lista vacía de authorities
                UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(email, null, List.of());
                
                // Guardamos el userId en los detalles para poder usarlo en los controllers
                authToken.setDetails(userId);
                
                // Guardamos la autenticación en el contexto de Spring Security
                // A partir de aquí, Spring sabe que el usuario está autenticado
                SecurityContextHolder.getContext().setAuthentication(authToken);
            }
        }

        // Continuamos con la cadena de filtros
        filterChain.doFilter(request, response);
    }
}
