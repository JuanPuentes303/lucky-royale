# Lucky Royale

**Plataforma de simulación de juegos de casino desarrollada con Angular, Ionic y Capacitor.**

Lucky Royale es un proyecto académico y demostrativo que reúne diferentes juegos de azar simulados en una aplicación web adaptable a dispositivos móviles y preparada para ejecutarse como aplicación Android.

La plataforma permite crear cuentas, iniciar sesión, explorar diferentes juegos, consultar estadísticas personales y revisar el historial de partidas.

> **Importante:** Lucky Royale es un proyecto educativo y recreativo. No constituye un casino comercial, no procesa apuestas con dinero real y no permite realizar depósitos ni retiros.

---

## Características principales

- Autenticación: registro, inicio y cierre de sesión.
- Dashboard: panel principal con acceso a los juegos disponibles.
- Seis juegos: Blackjack, Ruleta, Póker, Dados, Tragamonedas y Bacará.
- Perfil de usuario: consulta de información y actividad.
- Estadísticas: seguimiento de partidas, victorias, derrotas y empates.
- Historial: registro de resultados de las partidas.
- Consentimiento legal: aceptación de términos y condiciones y política de privacidad.
- Almacenamiento local: persistencia de información mediante un servicio centralizado.
- Aplicación Android: integración mediante Capacitor para generar APK.

## Tecnologías utilizadas

| Tecnología | Función |
|---|---|
| Angular 22 | Framework principal |
| TypeScript | Lenguaje de programación |
| Ionic | Componentes e interfaz móvil |
| SCSS | Estilos de la aplicación |
| Capacitor 8 | Integración con Android |
| Capacitor Preferences | Almacenamiento nativo |
| Vitest | Pruebas unitarias |
| Playwright | Pruebas end-to-end |
| ESLint | Análisis de código |
| Prettier | Formato del código |

## Arquitectura del proyecto

El proyecto utiliza una arquitectura modular basada en funcionalidades, separando responsabilidades para facilitar el mantenimiento y la ampliación de la aplicación.

```text
lucky-royale/
│
├── android/                 # Proyecto nativo Android
│
├── e2e/                     # Pruebas end-to-end
│
├── src/
│   └── app/
│       │
│       ├── core/
│       │   ├── guards/      # Protección de rutas
│       │   ├── interceptors/# Interceptores
│       │   └── services/    # Servicios centrales
│       │
│       ├── features/
│       │   ├── auth/        # Autenticación
│       │   ├── dashboard/   # Panel principal
│       │   ├── games/       # Juegos
│       │   ├── legal/       # Consentimiento legal
│       │   └── profile/     # Perfil y estadísticas
│       │
│       ├── shared/
│       │   ├── interfaces/  # Contratos de datos
│       │   ├── models/      # Modelos compartidos
│       │   ├── components/  # Componentes reutilizables
│       │   └── pipes/       # Pipes compartidos
│       │
│       ├── app.component.ts
│       ├── app.routes.ts
│       └── app.component.html
│
├── capacitor.config.ts
├── angular.json
├── package.json
└── README.md
```

## Servicios principales

Los servicios se encuentran en `src/app/core/services/`.

| Servicio | Responsabilidad |
|---|---|
| AuthService | Gestiona el registro, inicio y cierre de sesión. |
| StorageService | Centraliza la lectura, escritura y eliminación de información almacenada. |
| StatisticsService | Registra resultados y calcula estadísticas e historial. |
| LegalConsentService | Gestiona la aceptación de los documentos legales. |

Estos servicios permiten separar la lógica de funcionamiento de las interfaces visuales.

## Componentes principales

- **LoginPage:** permite iniciar sesión.
- **RegisterPage:** permite registrar nuevos usuarios.
- **DashboardPage:** presenta los juegos disponibles y permite navegar entre ellos.
- **ProfilePage:** muestra información del usuario, estadísticas e historial.
- **LegalConsentModalComponent:** presenta los documentos legales y gestiona su aceptación.

Cada juego cuenta con su propia página, plantilla HTML y hoja de estilos.

## Juegos disponibles

| Juego | Ruta |
|---|---|
| Blackjack | `/games/blackjack` |
| Ruleta | `/games/roulette` |
| Póker | `/games/poker` |
| Dados | `/games/dice` |
| Tragamonedas | `/games/slots` |
| Bacará | `/games/baccarat` |

Las definiciones de los juegos se centralizan en:

`src/app/shared/models/game.model.ts`

Sus identificadores y tipos se encuentran en:

`src/app/shared/interfaces/game.interface.ts`

## Navegación y seguridad

La navegación se configura en `src/app/app.routes.ts`.

Angular Router permite desplazarse entre las diferentes páginas de la aplicación.

Se utilizan dos guards principales:

- **authGuard:** impide acceder a páginas privadas sin autenticación.
- **guestGuard:** restringe el acceso a páginas destinadas a usuarios no autenticados.

Las páginas se cargan mediante carga diferida (*lazy loading*), utilizando `loadComponent`, lo que permite organizar mejor los recursos de la aplicación.

## Almacenamiento de información

El almacenamiento está centralizado mediante `StorageService`.

`StatisticsService` utiliza este mecanismo para guardar y recuperar:

- Estadísticas por juego.
- Cantidad de partidas realizadas.
- Victorias, derrotas y empates.
- Historial de resultados.

La información se organiza por usuario para mantener separados sus registros.

La integración con Capacitor Preferences permite utilizar almacenamiento nativo en Android.

## Instalación y ejecución

### Requisitos previos

- Node.js.
- npm.
- Angular CLI.
- Android Studio (para compilar la aplicación Android).

### 1. Clonar el repositorio

```bash
git clone https://github.com/JuanPuentes303/lucky-royale.git
```

### 2. Entrar al proyecto

```bash
cd lucky-royale
```

### 3. Instalar dependencias

```bash
npm install
```

### 4. Ejecutar en desarrollo

```bash
npx ng serve
```

La aplicación estará disponible en:

`http://localhost:4200`

## Compilación para Android

Lucky Royale utiliza Capacitor para integrar la aplicación web con el entorno nativo de Android.

Después de realizar modificaciones en el código:

```bash
npm run build
```

Sincronizar los archivos web con Android:

```bash
npx cap sync android
```

Abrir el proyecto en Android Studio:

```bash
npx cap open android
```

Desde Android Studio se puede ejecutar la aplicación en un dispositivo o emulador y generar el APK desde las opciones de compilación.

**Nota:** El proyecto Android se agrega una sola vez mediante `npx cap add android`. No es necesario repetir este comando después de cada modificación.

## Pruebas y calidad del código

El proyecto cuenta con herramientas para comprobar su funcionamiento y mantener la calidad del código.

### Verificar el código

```bash
npm run lint
```

Este comando ejecuta ESLint, la comprobación de tipos de las pruebas E2E y Prettier.

### Ejecutar pruebas

```bash
npm test
```

Ejecuta las pruebas unitarias y las pruebas end-to-end.

### Compilar la aplicación

```bash
npm run build
```

Genera la versión de producción en la carpeta `www/`.

## Propósito académico

Este proyecto permite aplicar conocimientos de desarrollo de software, programación orientada a componentes, arquitectura modular, servicios, navegación, almacenamiento local, pruebas automatizadas e integración de aplicaciones web con dispositivos móviles.

---

**Lucky Royale**

Entretenimiento y simulación recreativa.
