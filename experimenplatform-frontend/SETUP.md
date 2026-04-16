# Empiria Frontend — Setup

## Requisitos
- Node.js 20+
- Backend Spring Boot corriendo en `localhost:8080`
- Proyecto Supabase creado

## Pasos

1. **Instalar dependencias**
   ```bash
   npm install
   ```

2. **Configurar variables de entorno**
   ```bash
   cp .env.example .env
   # Edita .env con tu URL y anon key de Supabase
   ```

3. **Arrancar en desarrollo**
   ```bash
   npm run dev
   # → http://localhost:3000
   ```

4. **Build de producción**
   ```bash
   npm run build
   ```

## Alias de importación
El proyecto usa `@/` como alias de `src/`. Ejemplo:
```js
import Button from '@/components/ui/Button'
```

## Próximos pasos recomendados
1. Implementar `Landing.jsx` (pantalla de login/registro, fondo de partículas)
2. Implementar `Dashboard.jsx` del investigador
3. Implementar `ExperimentWizard.jsx` (5 pasos)
4. Implementar `Questionnaire.jsx` para participantes
